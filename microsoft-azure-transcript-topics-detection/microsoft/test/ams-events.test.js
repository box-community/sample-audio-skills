const AMSEvents = require('../ams-events');

describe('AMSEvents', () => {
    test('isMicrosoftAzureEvent()', () => {
        const microsoftAzureEventBody =
            '[{\r\n  "topic": "/subscriptions/add48eb1-619f-4aa9-909b-e924c5e3fee5/resourceGroups/box_dev_ams_us_west2/providers/Microsoft.Media/mediaservices/boxdevamsuswest2",\r\n  "subject": "transforms/AudioAnalyzerTransform/jobs/skills-job-4d8a259c-d88b-4b12-b662-3095a09f3677--32fd4b09-f283-476d-b699-795265ec0022",\r\n  "eventType": "Microsoft.Media.JobStateChange",\r\n  "eventTime": "2018-06-12T23:47:33.5772814",\r\n  "id": "3eb4e0ac-03f7-4fff-a56c-4bff5e11a448",\r\n  "data": {\r\n    "previousState": "Queued",\r\n    "state": "Scheduled"\r\n  },\r\n  "dataVersion": "1.0",\r\n  "metadataVersion": "1"\r\n}]';
        expect(AMSEvents.isMicrosoftAzureEvent(JSON.parse(microsoftAzureEventBody))).toEqual(true);
    });
    test('isMicrosoftAzureEventFalse()', () => {
        const microsoftAzureEventBody =
            '[{\r\n  "topic": "/subscriptions/add48eb1-619f-4aa9-909b-e924c5e3fee5/resourceGroups/box_dev_ams_us_west2/providers/Microsoft.Media/mediaservices/boxdevamsuswest2",\r\n  "subject": "transforms/AudioAnalyzerTransform/jobs/skills-job-4d8a259c-d88b-4b12-b662-3095a09f3677--32fd4b09-f283-476d-b699-795265ec0022",\r\n  "eventType": "Media.JobStateChange",\r\n  "eventTime": "2018-06-12T23:47:33.5772814",\r\n  "id": "3eb4e0ac-03f7-4fff-a56c-4bff5e11a448",\r\n  "data": {\r\n    "previousState": "Queued",\r\n    "state": "Scheduled"\r\n  },\r\n  "dataVersion": "1.0",\r\n  "metadataVersion": "1"\r\n}]';
        expect(AMSEvents.isMicrosoftAzureEvent(JSON.parse(microsoftAzureEventBody))).toEqual(false);
    });

    test('isAzureSubscriptionDeletionEvent()', () => {
        const microsoftAzureEventBody =
            '[{\r\n  "topic": "/subscriptions/add48eb1-619f-4aa9-909b-e924c5e3fee5/resourceGroups/box_dev_ams_us_west2/providers/Microsoft.Media/mediaservices/boxdevamsuswest2",\r\n  "subject": "transforms/AudioAnalyzerTransform/jobs/skills-job-4d8a259c-d88b-4b12-b662-3095a09f3677--32fd4b09-f283-476d-b699-795265ec0022",\r\n  "eventType": "Microsoft.EventGrid.SubscriptionDeletedEvent",\r\n  "eventTime": "2018-06-12T23:47:33.5772814",\r\n  "id": "3eb4e0ac-03f7-4fff-a56c-4bff5e11a448",\r\n  "data": {\r\n    "previousState": "Queued",\r\n    "state": "Scheduled"\r\n  },\r\n  "dataVersion": "1.0",\r\n  "metadataVersion": "1"\r\n}]';
        expect(AMSEvents.isAzureSubscriptionDeletionEvent(JSON.parse(microsoftAzureEventBody))).toEqual(true);
    });

    test('isAzureSubscriptionValidationEvent()', () => {
        const microsoftAzureEventBody =
            '[{\r\n  "id": "239b273f-5a0c-44cd-86e7-2dbdd880517f",\r\n  "topic": "/subscriptions/add48eb1-619f-4aa9-909b-e924c5e3fee5/resourceGroups/box_dev_ams_us_west2/providers/microsoft.media/mediaservices/boxdevamsuswest2",\r\n  "subject": "",\r\n  "data": {\r\n    "validationCode": "2AA6C4AF-84A8-4C62-89D4-ABDC6C10EC24",\r\n    "validationUrl": "https://rp-westus2.eventgrid.azure.net/eventsubscriptions/box-skills-ms-ams-video-audio-subscription-dev/validate?id=2AA6C4AF-84A8-4C62-89D4-ABDC6C10EC24&t=2018-06-13T22:09:38.2881710Z&apiVersion=2018-05-01-preview&token=oFcYRxbhOqIrcu%2fSJDqzPOoApni5OGM3IHseQ2ItMzk%3d"\r\n  },\r\n  "eventType": "Microsoft.EventGrid.SubscriptionValidationEvent",\r\n  "eventTime": "2018-06-13T22:09:38.288171Z",\r\n  "metadataVersion": "1",\r\n  "dataVersion": "2"\r\n}]';
        expect(AMSEvents.isAzureSubscriptionValidationEvent(JSON.parse(microsoftAzureEventBody))).toEqual(true);
    });

    test('isAzureMediaFinishedJobStateChangeEvent()', () => {
        const microsoftAzureEventBody =
            '[{\r\n  "topic": "/subscriptions/add48eb1-619f-4aa9-909b-e924c5e3fee5/resourceGroups/box_dev_ams_us_west2/providers/Microsoft.Media/mediaservices/boxdevamsuswest2",\r\n  "subject": "transforms/AudioAnalyzerTransform/jobs/skills-job-4d8a259c-d88b-4b12-b662-3095a09f3677--32fd4b09-f283-476d-b699-795265ec0022",\r\n  "eventType": "Microsoft.Media.JobStateChange",\r\n  "eventTime": "2018-06-12T23:50:33.572863",\r\n  "id": "24c346c4-9ab2-4730-930a-d3e95c775835",\r\n  "data": {\r\n    "previousState": "Processing",\r\n    "state": "Finished"\r\n  },\r\n  "dataVersion": "1.0",\r\n  "metadataVersion": "1"\r\n}]';
        expect(AMSEvents.isAzureMediaFinishedJobStateChangeEvent(JSON.parse(microsoftAzureEventBody))).toEqual(true);
    });

    test('isAzureMediaCanceledJobStateChangeEvent()', () => {
        const microsoftAzureEventBody =
            '[{\r\n  "topic": "/subscriptions/add48eb1-619f-4aa9-909b-e924c5e3fee5/resourceGroups/box_dev_ams_us_west2/providers/Microsoft.Media/mediaservices/boxdevamsuswest2",\r\n  "subject": "transforms/VideoAnalyzerTransform/jobs/skills-job-316c159f-99d3-47ff-8822-2b4cdd25bfa2--3ebdaf96-7390-422a-931c-b9f8bdeaa655",\r\n  "eventType": "Microsoft.Media.JobStateChange",\r\n  "eventTime": "2018-06-13T05:21:26.6609941",\r\n  "id": "ad38b38f-facf-46f1-ad59-81ef0ad674c7",\r\n  "data": {\r\n    "previousState": "Processing",\r\n    "state": "Canceled"\r\n  },\r\n  "dataVersion": "1.0",\r\n  "metadataVersion": "1"\r\n}]';
        expect(AMSEvents.isAzureMediaCanceledJobStateChangeEvent(JSON.parse(microsoftAzureEventBody))).toEqual(true);
    });

    test('isAzureMediaErrorJobStateChangeEvent()', () => {
        const microsoftAzureEventBody =
            '[{\r\n  "topic": "/subscriptions/add48eb1-619f-4aa9-909b-e924c5e3fee5/resourceGroups/box_dev_ams_us_west2/providers/Microsoft.Media/mediaservices/boxdevamsuswest2",\r\n  "subject": "transforms/VideoAnalyzerTransform/jobs/skills-job-37d934cd-76d4-4a2b-886e-ae7424468c16--9741378c-b918-4ad6-a565-9edb67cffb77",\r\n  "eventType": "Microsoft.Media.JobStateChange",\r\n  "eventTime": "2018-06-12T23:54:25.4607396",\r\n  "id": "272e9650-79aa-4c46-a73c-5884a4fc9168",\r\n  "data": {\r\n    "previousState": "Processing",\r\n    "state": "Error"\r\n  },\r\n  "dataVersion": "1.0",\r\n  "metadataVersion": "1"\r\n}]';
        expect(AMSEvents.isAzureMediaErrorJobStateChangeEvent(JSON.parse(microsoftAzureEventBody))).toEqual(true);
    });

    test('getAzureSubscriptionValidationResponse()', () => {
        const microsoftAzureEventBody =
            '[{\r\n  "id": "239b273f-5a0c-44cd-86e7-2dbdd880517f",\r\n  "topic": "/subscriptions/add48eb1-619f-4aa9-909b-e924c5e3fee5/resourceGroups/box_dev_ams_us_west2/providers/microsoft.media/mediaservices/boxdevamsuswest2",\r\n  "subject": "",\r\n  "data": {\r\n    "validationCode": "2AA6C4AF-84A8-4C62-89D4-ABDC6C10EC24",\r\n    "validationUrl": "https://rp-westus2.eventgrid.azure.net/eventsubscriptions/box-skills-ms-ams-video-audio-subscription-dev/validate?id=2AA6C4AF-84A8-4C62-89D4-ABDC6C10EC24&t=2018-06-13T22:09:38.2881710Z&apiVersion=2018-05-01-preview&token=oFcYRxbhOqIrcu%2fSJDqzPOoApni5OGM3IHseQ2ItMzk%3d"\r\n  },\r\n  "eventType": "Microsoft.EventGrid.SubscriptionValidationEvent",\r\n  "eventTime": "2018-06-13T22:09:38.288171Z",\r\n  "metadataVersion": "1",\r\n  "dataVersion": "2"\r\n}]';
        expect(AMSEvents.getAzureSubscriptionValidationResponse(JSON.parse(microsoftAzureEventBody))).toEqual(
            '{"validationResponse":"2AA6C4AF-84A8-4C62-89D4-ABDC6C10EC24"}'
        );
    });
});
