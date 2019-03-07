// @flow

/**
 * @fileoverview AMSIndexer interfaces with the Microsoft Azure API using the node SDK.
 * 1) Authenticates using service principal name and secret; reference:(https://github.com/Azure/azure-sdk-for-node/tree/master/runtime/ms-rest-azure)
 * 2) Creates a job to submit to MS Video Indexer using ams-subscription.
 * 3) Handles the data returned to the finished job.
 */

const util = require('util');
const url = require('url');
const cloneDeep = require('lodash/cloneDeep');

const uuidv4 = require('uuid/v4');
const MediaServices = require('azure-arm-mediaservices');
const msRestAzure = require('ms-rest-azure');
const azureStorage = require('azure-storage');
const find = require('lodash/find');
const AMSSubscription = require('./ams-subscription');
const { SkillsErrorEnum } = require('./box/skills-kit-2.1');
const Logger = require('./box/logger-manager');
const EncryptionManager = require('.box/encryption-manager');
const MediaType = require('./../mediatype/MediaType');

// Microsoft constants
const VIDEO_ANALYZER_PRESET_ODATATYPE = '#Microsoft.Media.VideoAnalyzerPreset';
const AUDIO_ANALYZER_PRESET_ODATATYPE = '#Microsoft.Media.AudioAnalyzerPreset';
const MS_MEDIA_JOB_OUTPUT_ASSET = '#Microsoft.Media.JobOutputAsset';
const MS_MEDIA_JOB_INPUT_HTTP = '#Microsoft.Media.JobInputHttp';

const OUTPUT_PREFIX = 'skills-output';
const JOB_PREFIX = 'skills-job';

class AMSIndexer {
    scalar: Object;
    fileContext: Object;
    jobId: string;
    subscriptionName: string;
    apiGatewayURL: string;
    language: string;
    transformName: string;
    analyzerPresetOdatatype: string;
    azureMediaServicesClient: Object;

    constructor(fileContext: Object, scalar: Object, host?: string, path?: string, apiId?: string) {
        /* eslint-disable camelcase */
        this.scalar = scalar;
        this.fileContext = fileContext;
        this.jobId = scalar.jobId || uuidv4();
        // in language-region BCP-47 format-  'en-US', 'fr-FR', 'it-IT', 'ja-JP', 'pt-BR', 'zh-CN', 'de-DE', 'ar-EG', 'ru-RU', 'hi-IN'
        this.language = process.env.LANGUAGE;
        this.apiGatewayURL = host && path ? `https://${host}${path}` : null;
        this.subscriptionName = apiId && path ? `${apiId}${path.replace(/\//g, '-')}` : null;
        if (this.fileContext.fileType === MediaType.VIDEO.value) {
            this.transformName = `VideoAnalyzerTransform_${this.language}`;
            this.analyzerPresetOdatatype = VIDEO_ANALYZER_PRESET_ODATATYPE;
        } else {
            this.transformName = `AudioAnalyzerTransform_${this.language}`;
            this.analyzerPresetOdatatype = AUDIO_ANALYZER_PRESET_ODATATYPE;
        }
        /* eslint-disable camelcase */
    }

    static getEnvironmentConfig() {
        return {
            environment: {
                activeDirectoryResourceId: process.env.ARM_AAD_AUDIENCE,
                resourceManagerEndpointUrl: process.env.ARM_ENDPOINT,
                activeDirectoryEndpointUrl: process.env.AAD_ENDPOINT
            }
        };
    }

    async setAzureMediaServicesClient(credentials: Object) {
        this.azureMediaServicesClient = new MediaServices(
            credentials,
            this.scalar.subscription_id,
            process.env.ARM_ENDPOINT,
            {
                noRetryPolicy: true
            }
        );
    }

    async getMediaServices(credentials: Object) {
        this.setAzureMediaServicesClient(credentials);
        const mediaService = await this.azureMediaServicesClient.mediaservices.get(
            this.scalar.resource_group,
            this.scalar.account_name
        );
        return mediaService;
    }

    getAnalyzerPreset() {
        return {
            odatatype: this.analyzerPresetOdatatype,
            audioLanguage: this.language
        };
    }

    async createTransform() {
        const transform = await this.azureMediaServicesClient.transforms.createOrUpdate(
            this.scalar.resource_group,
            this.scalar.account_name,
            this.transformName,
            {
                name: this.transformName,
                location: this.scalar.region,
                outputs: [{ preset: this.getAnalyzerPreset() }]
            }
        );
        return transform;
    }

    async createOutputAsset() {
        try {
            return this.azureMediaServicesClient.assets.createOrUpdate(
                this.scalar.resource_group,
                this.scalar.account_name,
                this.getAssetName(),
                {}
            );
        } catch (err) {
            Logger.logError(`Microsoft Internal Server Error: ${util.inspect(err)}`);
            const parsedError = new ErrorParser(err.code).parseAMSAudioVideoError();
            throw new Error(parsedError.getSkillsErrorCode());
        }
    }

    getEncryptedcorrelationData() {
        // for callback object, we set few job details into scalar
        this.scalar.jobId = this.jobId;
        this.scalar.jobCreatedTime = Date.now();
        const encryptedScalar = EncryptionManager.encrypt(
            process.env.SYMMETRIC_ENCRYPTION_KEY,
            JSON.stringify(this.scalar)
        );
        // every field has a 1000 character limit, so we
        // pass long token as a seperate field
        const encryptedToken = EncryptionManager.encrypt(
            process.env.SYMMETRIC_ENCRYPTION_KEY,
            JSON.stringify(this.fileContext.fileWriteToken)
        );

        const context = cloneDeep(this.fileContext);
        context.fileDownloadURL = null; // saving space
        context.fileReadToken = null; // saving space
        context.fileWriteToken = null; // saving space
        const encryptedFileContext = EncryptionManager.encrypt(
            process.env.SYMMETRIC_ENCRYPTION_KEY,
            JSON.stringify(context)
        );
        return { encryptedScalar, encryptedToken, encryptedFileContext };
    }

    async createJob(jobOutputs, jobInput) {
        // Job created with correlationData and tokenData because for correlationData object,
        // max length of each value is 1000 characters. So split the data.
        return this.azureMediaServicesClient.jobs.create(
            this.scalar.resource_group,
            this.scalar.account_name,
            this.transformName,
            this.getJobName(),
            {
                input: jobInput,
                outputs: jobOutputs,
                correlationData: this.getEncryptedcorrelationData()
            }
        );
    }

    async submitJob() {
        const outputAsset = await this.createOutputAsset();
        const jobInput = {
            odatatype: MS_MEDIA_JOB_INPUT_HTTP,
            files: [this.fileContext.fileDownloadURL]
        };
        const jobOutputs = [
            {
                odatatype: MS_MEDIA_JOB_OUTPUT_ASSET,
                assetName: outputAsset.name
            }
        ];
        try {
            await this.createTransform();
            const createdJob = await this.createJob(jobOutputs, jobInput);
            return createdJob;
        } catch (err) {
            if (err.message === `The transform '${this.transformName}' was not found.`) {
                Logger.logDebug('Transform not found. Creating new transform.');
                await this.createTransform();
                const createdJob = await this.createJob(jobOutputs, jobInput);
                return createdJob;
            }
            throw err;
        }
    }

    async getCredentials() {
        try {
            return msRestAzure.loginWithServicePrincipalSecret(
                this.scalar.aad_client_id,
                this.scalar.aad_secret,
                this.scalar.aad_tenant_id,
                AMSIndexer.getEnvironmentConfig()
            );
        } catch (err) {
            Logger.logError(`Error logging to ms rest azure with service principal secret: ${util.inspect(err)}`);
            throw err;
        }
    }

    async submitJobToIndexer() {
        try {
            const credentials = await this.getCredentials();
            const mediaServices = await this.getMediaServices(credentials);

            // Create a new AMSSubscription to handle event grid subscription functionality
            const subscriptionHandler = new AMSSubscription(
                this.scalar.subscription_id,
                this.scalar.account_name,
                this.apiGatewayURL,
                this.scalar.resource_group,
                this.subscriptionName
            );
            Logger.logDebug(
                `Existing event grid subscriptions: ${JSON.stringify(
                    await subscriptionHandler.listExistingEventGridSubscriptions(credentials)
                )}`
            );
            await subscriptionHandler.createOrUpdateEventGridSubscription(credentials, mediaServices.id);
            const job = await this.submitJob();
            Logger.logInfo(`Job created with id: ${job.id}`);
        } catch (e) {
            if (e.message && e.message.includes('invalid_client')) {
                throw new Error(SkillsErrorEnum.FILE_PROCESSING_ERROR);
            } else {
                Logger.logInfo(`Submitting job error caught ${util.inspect(e)}`);
                throw e;
            }
        }
    }

    getJobName() {
        return `${JOB_PREFIX}-${this.jobId}`;
    }

    getAssetName() {
        return `${OUTPUT_PREFIX}-${this.jobId}`;
    }

    static async getBlobsSegmented(sharedBlobService: Object, containerName: string) {
        return new Promise((resolve, reject) =>
            sharedBlobService.listBlobsSegmented(containerName, null, (err, result) => {
                if (err) {
                    Logger.logError(`Error getting blobs: ${util.inspect(err)}`);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        );
    }

    static async getInsightsJson(sharedBlobService: Object, containerName: string, insightsName: string) {
        return new Promise((resolve, reject) =>
            sharedBlobService.getBlobToText(containerName, insightsName, (error, result) => {
                if (error) {
                    Logger.logInfo(`Error getting insights.json: ${util.inspect(error)}`);
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        );
    }

    async cleanUp() {
        await this.azureMediaServicesClient.jobs.deleteMethod(
            this.scalar.resource_group,
            this.scalar.account_name,
            this.transformName,
            this.getJobName()
        );
        await this.azureMediaServicesClient.assets.deleteMethod(
            this.scalar.resource_group,
            this.scalar.account_name,
            this.getAssetName()
        );
    }

    async getJobErrorDetails() {
        const credentials = await this.getCredentials();
        this.setAzureMediaServicesClient(credentials);
        return this.azureMediaServicesClient.jobs.get(
            this.scalar.resource_group,
            this.scalar.account_name,
            this.transformName,
            this.getJobName()
        );
    }

    async downloadVideoInsights() {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        const input = { permissions: 'Read', expiryTime: date };
        const credentials = await this.getCredentials();
        this.setAzureMediaServicesClient(credentials);

        const assetContainerSas = await this.azureMediaServicesClient.assets.listContainerSas(
            this.scalar.resource_group,
            this.scalar.account_name,
            this.getAssetName(),
            input
        );
        const containerSasUrl = assetContainerSas.assetContainerSasUrls[0] || null;
        const sasUri = url.parse(containerSasUrl);
        const sharedBlobService = azureStorage.createBlobServiceWithSas(sasUri.host, sasUri.search);
        const containerName = sasUri.pathname.replace(/^\/+/g, '');
        const blobs = await AMSIndexer.getBlobsSegmented(sharedBlobService, containerName);

        // Read insights.json
        const insights = find(blobs.entries, (o) => o.blobType === 'BlockBlob' && o.name === 'insights.json');
        const insightsJSON = await AMSIndexer.getInsightsJson(sharedBlobService, containerName, insights.name);

        return { containerSasUrl, insights: JSON.parse(insightsJSON) };
    }
}

module.exports = AMSIndexer;
