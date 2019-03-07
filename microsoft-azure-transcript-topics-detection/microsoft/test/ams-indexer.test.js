const AMSIndexer = require('../ams-indexer');

describe('AMSIndexer', () => {
    const fileContext = {
        fileWriteToken: 'mock_write_token',
        fileReadToken: 'mock_read_token',
        fileId: 'mock_file_id',
        fileDownloadURL: 'https://api.box.com/2.0/files/mock_file_id/content?access_token=mock_read_token',
        requestId: 'mock_box_id',
        fileType: 'VIDEO'
    };

    const scalar = {
        subscription_id: 'mock_subscription_id',
        region: 'mock_region',
        resource_group: 'mock_resource_group',
        account_name: 'mock_account_name',
        aad_tenant_id: 'mock_aad_tenant_id',
        aad_client_id: 'mock_aad_client_id',
        aad_secret: 'mock_aad_secret'
    };

    const host = 'mock_host';
    const path = 'mock_path';
    const apiId = 'mock_api_id';

    process.env.LANGUAGE = 'en_US';
    process.env.BOX_API_ENDPOINT = 'https://api.box.com/2.0';
    process.env.SYMMETRIC_ENCRYPTION_KEY = 'mockKey';

    const indexer = new AMSIndexer(fileContext, scalar, host, path, apiId);
    indexer.jobId = 'mock_job_id';

    indexer.getEnvironmentConfig = jest.fn().mockReturnValue({
        environment: {
            activeDirectoryResourceId: 'https://management.core.windows.net/',
            resourceManagerEndpointUrl: 'https://management.azure.com/',
            activeDirectoryEndpointUrl: 'https://login.microsoftonline.com/'
        }
    });
    const mockMediaService = {
        mediaservices: {
            get: jest.fn()
        },
        transforms: {
            createOrUpdate: jest.fn()
        },
        assets: {
            createOrUpdate: jest
                .fn()
                .mockImplementationOnce(() => {
                    const err = new Error('message');
                    err.code = 'InternalServerError';
                    throw err;
                })
                .mockImplementationOnce(() => {
                    throw new Error('message');
                })
                .mockImplementation(() => ({ name: 'Asset' }))
        },
        jobs: {
            create: jest.fn()
        }
    };
    indexer.getEnvironmentConfig = jest.fn().mockReturnValue((indexer.azureMediaServicesClient = mockMediaService));

    test('AMSIndexer()', () => {
        expect(indexer.transformName).toEqual('VideoAnalyzerTransform_en_US');
        expect(indexer.analyzerPresetOdatatype).toEqual('#Microsoft.Media.VideoAnalyzerPreset');
    });

    test('getAnalyzerPreset()', () => {
        const analyzerPreset = {
            odatatype: '#Microsoft.Media.VideoAnalyzerPreset',
            audioLanguage: 'en_US'
        };
        expect(indexer.getAnalyzerPreset()).toEqual(analyzerPreset);
    });

    test('getJobName()', () => {
        expect(indexer.getJobName()).toEqual('skills-job-mock_job_id');
    });

    test('getAssetName()', () => {
        expect(indexer.getAssetName()).toEqual('skills-output-mock_job_id');
    });

    test('getMediaServices()', async () => {
        // confirm the this.azureMediaServicesClient.mediaservices.get is being called with the correct values
        await indexer.getMediaServices({});
        expect(mockMediaService.mediaservices.get).toBeCalledWith('mock_resource_group', 'mock_account_name');
    });

    test('createTransform()', async () => {
        // confirm the this.azureMediaServicesClient.mediaservices.get is being called with the correct values
        await indexer.createTransform();
        expect(mockMediaService.transforms.createOrUpdate).toBeCalledWith(
            'mock_resource_group',
            'mock_account_name',
            'VideoAnalyzerTransform_en_US',
            {
                location: 'mock_region',
                name: 'VideoAnalyzerTransform_en_US',
                outputs: [{ preset: { audioLanguage: 'en_US', odatatype: '#Microsoft.Media.VideoAnalyzerPreset' } }]
            }
        );
    });

    test('createOutputAsset() Internal Server Error', async () => {
        // confirm the this.azureMediaServicesClient.mediaservices.get is being called with the correct values
        try {
            await indexer.createOutputAsset();
        } catch (e) {
            expect(
                e.message ===
                    '{"errorCode":"skills_internal_server_error","errorMessage":"Something went wrong with running this skill or fetching its data."}'
            );
        }
    });
    test('createOutputAsset() Other Error', async () => {
        // confirm the this.azureMediaServicesClient.mediaservices.get is being called with the correct values
        try {
            await indexer.createOutputAsset();
        } catch (e) {
            expect(e.message === 'message');
        }
    });
    test('createOutputAsset() no Error', async () => {
        // confirm the this.azureMediaServicesClient.mediaservices.get is being called with the correct values
        expect(await indexer.createOutputAsset()).toEqual({ name: 'Asset' });
        expect(mockMediaService.assets.createOrUpdate).toBeCalledWith(
            'mock_resource_group',
            'mock_account_name',
            'skills-output-mock_job_id',
            {}
        );
    });

    test('getEncryptedcorrelationData, env variable is undefined', () => {
        try {
            indexer.getEncryptedcorrelationData();
        } catch (e) {
            expect(e.message === 'TypeError: Encryption key should be non-empty string');
        }
    });

    test('getEncryptedcorrelationData, mock encrypt function', () => {
        const correlationData = {
            encryptedScalar: {
                subscription_id: indexer.scalar.subscriptionId,
                region: indexer.scalar.region,
                resource_group: indexer.scalar.resourceGroup,
                account_name: indexer.scalar.accountName,
                aad_tenant_id: indexer.scalar.aadTenantId,
                aad_client_id: indexer.scalar.aadClientId,
                aad_secret: indexer.scalar.aadSecret,
                jobId: indexer.jobId
            },
            encryptedToken: { fileWriteToken: indexer.fileContext.fileWriteToken },
            encryptedFileContext: {
                requestId: indexer.fileContext.requestId,
                fileId: indexer.fileContext.fileId,
                skillId: indexer.fileContext.skillId,
                fileType: indexer.fileContext.fileType
            }
        };

        expect(indexer.getEncryptedcorrelationData()).not.toBe(JSON.stringify(correlationData));
    });

    test('submitJob() Transform not found error', async () => {
        // Expect the create job to fail, then call create transform, then correctly create a job
        indexer.createJob = jest
            .fn()
            .mockImplementationOnce(() => {
                throw new Error(`The transform '${indexer.transformName}' was not found.`);
            })
            .mockImplementationOnce(() => 'Job');
        indexer.createTransform = jest.fn();
        const job = await indexer.submitJob();
        expect(indexer.createTransform).toBeCalled();
        expect(job).toEqual('Job');
    });
    test('submitJob() Transform other error', async () => {
        // Expect the create job to fail, then call create transform, then correctly create a job
        indexer.createJob = jest.fn().mockImplementationOnce(() => {
            throw new Error('Message');
        });
        indexer.createTransform = jest.fn();
        try {
            await indexer.submitJob();
        } catch (e) {
            expect(e.message).toEqual('Message');
        }
    });
    test('submitJob() Transform no Error', async () => {
        // Expect the create job to fail, then call create transform, then correctly create a job
        indexer.createJob = jest.fn().mockImplementation(() => 'Job');
        indexer.createTransform = jest.fn();
        expect(await indexer.submitJob()).toEqual('Job');
    });
    test('submitJobToIndexer() invalid_client error', async () => {
        // Expect the create job to fail, then call create transform, then correctly create a job
        indexer.getCredentials = jest.fn().mockImplementationOnce(() => {
            throw new Error('invalid_client');
        });
        try {
            await indexer.submitJobToIndexer();
        } catch (e) {
            expect(e.message).toEqual('skills_file_processing_error');
        }
    });
    test('submitJobToIndexer() other error', async () => {
        // Expect the create job to fail, then call create transform, then correctly create a job
        indexer.getCredentials = jest.fn().mockImplementationOnce(() => {
            throw new Error('Message');
        });
        try {
            await indexer.submitJobToIndexer();
        } catch (e) {
            expect(e.message).toEqual('Message');
        }
    });
});
