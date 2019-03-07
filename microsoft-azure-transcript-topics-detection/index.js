/**
 * @fileoverview The lambda handler.
 */

// @flow

const Logger = require('./box/logger-manager');
const ErrorParser = require('./box/error-parser');
const EncryptionManager = require('./box/encryption-manager');
const BoxEventManager = require('./box/box-event-manager');
const { SkillsWriter, SkillsErrorEnum } = require('./box/skills-kit-2.1');
const AMSIndexer = require('./microsoft/ams-indexer');
const AMSEvents = require('./microsoft/ams-events');
const AMSAdaptor = require('./microsoft/ams-adaptor');
const get = require('lodash/get');
const util = require('util');

const VIDEO_SKILL_IDS = process.env.VIDEO_SKILL_IDS.replace(/\s/g, '').split(',');

/**
 * This function completes the necessary setup for the MS Azure events.
 *
 * @param {Object} contextData - data saved in Redis for current event
 * @return {undefined}
 */
const setupProcessAzureEvent = (eventBody: Object) => {
    const { encryptedScalar, encryptedToken, encryptedFileContext } = get(eventBody, 'data.correlationData');

    const scalarData = EncryptionManager.decrypt(process.env.SYMMETRIC_ENCRYPTION_KEY, encryptedScalar);
    const tokenData = EncryptionManager.decrypt(process.env.SYMMETRIC_ENCRYPTION_KEY, encryptedToken);
    const fileContextData = EncryptionManager.decrypt(process.env.SYMMETRIC_ENCRYPTION_KEY, encryptedFileContext);

    // contextData is the data set on job and gets returned as part of AMS notifications.
    const scalar = JSON.parse(scalarData);
    const fileContext = JSON.parse(fileContextData);
    fileContext.fileWriteToken = JSON.parse(tokenData);

    Logger.setupLogger(fileContext.requestId, fileContext.fileId);
    const indexer = new AMSIndexer(fileContext, scalar);
    const skillsWriter = new SkillsWriter(fileContext);
    return {
        skillsWriter,
        indexer
    };
};

/**
 * This function handles the MS Azure event with 'Finished' state.
 *
 * @param {Object} eventBody - event body info
 * @return {undefined}
 */
const processAzureFinishedEvent = async (skillsWriter: Object, indexer: Object) => {
    Logger.logInfo('Processing Azure Success Event');
    const insightsDetails = await indexer.downloadVideoInsights();
    Logger.logDebug(`Insights: ${JSON.stringify(insightsDetails)}`);
    const { cards, duration } = await AMSAdaptor.getSkillMetadataCards(skillsWriter, insightsDetails);
    Logger.logDebug(`Video breakdowns fetched and converted to skills metadata: ${JSON.stringify(cards)}`);

    // Delete job details and assets from Microsoft
    await indexer.cleanUp();
    Logger.logInfo('Job details and assets deleted from Microsoft');

    // Save metadata to Box
    const callback = (status, error) => {
        if (error) {
            // in success case skills_invocations returns null
            Logger.logError(`Error saving metadata cards ${error}`);
            skillsWriter.saveErrorCard(SkillsErrorEnum.INVOCATIONS_ERROR);
        } else {
            Logger.logSkillSuccess(indexer.fileContext, indexer.scalar.jobCreatedTime); // eg. print: SKILL SUCCESS [MP4 | 2.4 MB | 2 MINUTES ]
        }
    };
    skillsWriter.saveDataCards(cards, callback, null, { unit: 'seconds', value: parseInt(duration, 10) });
};

/**
 * This function handles the MS Azure event with 'Error' state.
 *
 * @param {Object} eventBody - event body info
 * @return {undefined}
 */
const processAzureErrorEvent = async (skillsWriter: Object, indexer: Object) => {
    const errorDetails = await indexer.getJobErrorDetails();
    Logger.logError(`AMS job error details: ${JSON.stringify(errorDetails)}`);
    const errorMessage = get(errorDetails, 'outputs[0].error.details[0].message');
    const parsedError = new ErrorParser(errorMessage).parseAMSAudioVideoError();
    skillsWriter.saveErrorCard(parsedError.getSkillsErrorCode());

    // Delete job details and assets from Microsoft
    await indexer.cleanUp();
};

/**
 * This is the main function that the Lamba will call when invoked.
 *
 * @param {Object} event - data from the event, including the payload of the webhook, that triggered this function call
 * @param {Object} context - additional context information from the request (unused in this example)
 * @param {callback} callback - the function to call back to once finished
 * @return {null} - lambda callback
 */
module.exports.handler = async (event: Object, context: Object, callback: Function): void => {

    const parsedBody = JSON.parse(event.body);
    if (AMSEvents.isMicrosoftAzureEvent(parsedBody)) {
        const { skillsWriter, indexer } = setupProcessAzureEvent(parsedBody[0]);
        try {
            // Microsoft Event
            if (AMSEvents.isAzureSubscriptionDeletionEvent(parsedBody)) {
                Logger.logInfo(`Subscription deleted: ${parsedBody}`);
                return;
            }
            if (AMSEvents.isAzureSubscriptionValidationEvent(parsedBody)) {
                Logger.logInfo(`Subscription valid check: ${parsedBody}`);
                callback(null, {
                    statusCode: 200,
                    body: AMSEvents.getAzureSubscriptionValidationResponse(parsedBody)
                });
                return;
            }

            if (AMSEvents.isAzureMediaCanceledJobStateChangeEvent(parsedBody)) {
                Logger.logError(`Microsoft job got canceled: ${parsedBody}`);
            }

            if (AMSEvents.isAzureMediaErrorJobStateChangeEvent(parsedBody)) {
                Logger.logError(`Error in Microsoft job: ${JSON.stringify(event)}`);
                await processAzureErrorEvent(skillsWriter, indexer);
            }

            if (AMSEvents.isAzureMediaFinishedJobStateChangeEvent(parsedBody)) {
                Logger.logInfo('AMS processing success event recieved');
                Logger.logDebug(`AMS success event: ${JSON.stringify(event)}`);
                // Process Finished event and download results here
                await processAzureFinishedEvent(skillsWriter, indexer);
            }
            callback(null, { statusCode: 200, body: 'Eventgrid event processed' });
        } catch (error) {
            Logger.logError(`Exception while processing AMS finished event: ${util.inspect(error)}`);
            if (skillsWriter) await skillsWriter.saveErrorCard(SkillsErrorEnum.FILE_PROCESSING_ERROR);
        }
    } else {
        // Box Event
        let skillsWriter;

        try {
            // setup the skill development helper tools
            const { id, source } = JSON.parse(event.body);
            Logger.setupLogger(id, source.id); // Logger will now write back request and file id in the logs
            const filesReader = new FilesReader(event.body);
            skillsWriter = new SkillsWriter(filesReader.getFileContext());

            //validate allowed file formats and size limit
            const SKILL_ACCEPTED_FORMATS = process.env.SKILL_ACCEPTED_FORMATS.replace(/\s/g, '').split(',');
            filesReader.validateFormat(SKILL_ACCEPTED_FORMATS);
            if (process.env.SKILL_FILE_SIZE_LIMIT_MB) filesReader.validateSize(process.env.SKILL_FILE_SIZE_LIMIT_MB);

            const scalar = {
              aad_client_id : process.env.AAD_CLIENT_ID,
              aad_secret: process.env.AAD_SECRET,
              aad_tenant_id: process.env.AAD_TENANT_ID,
              subscription_id: process.env.SUBSCRIPTION_ID,
              resource_group: process.env.RESOURCE_GROUP,
              account_name: process.env.ACCOUNT_NAME,
              region: process.env.REGION
            }

            const indexer = new AMSIndexer(
                filesReader.getFileContext(),
                JSON.parse(scalar),
                event.headers.Host,
                event.requestContext.path,
                event.requestContext.apiId
            );
            await indexer.submitJobToIndexer();
        } catch (e) {
            Logger.logError(`Exception caught: ${e.message}`);
            if (skillsWriter) await skillsWriter.saveErrorCard(e.message);
        } finally {
            callback(null, {
                statusCode: 200,
                body: 'Event request processed'
            });
        }
    }
};
