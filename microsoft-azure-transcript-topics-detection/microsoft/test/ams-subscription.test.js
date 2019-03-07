const AMSSubscription = require('../ams-subscription');

describe('AMSIndexer', () => {
    const Subscription = new AMSSubscription(
        'mockSubscriptionId',
        'mockAccountName',
        'mockApiGatewayUrl',
        'mockResourceGroup',
        'mockSubscriptionName'
    );
    const mockEGMClient = {
        eventSubscriptions: {
            deleteMethod: jest.fn(),
            listByResource: jest.fn(),
            get: jest
                .fn()
                .mockImplementationOnce(() => 'subscription')
                .mockImplementationOnce(() => {
                    throw new Error('Error');
                }),
            createOrUpdate: jest.fn()
        }
    };
    Subscription.setEventGridManagementClient = jest.fn().mockImplementation(() => {
        Subscription.EGMClient = mockEGMClient;
    });
    test('deleteEventGridSubscription()', async () => {
        await Subscription.deleteEventGridSubscription({}, 'subscriptionScope', 'subscriptionName');
        expect(mockEGMClient.eventSubscriptions.deleteMethod).toBeCalledWith('subscriptionScope', 'subscriptionName');
    });
    test('listExistingEventGridSubscription()', async () => {
        await Subscription.listExistingEventGridSubscriptions({}, 'subscriptionScope', 'subscriptionName');
        expect(mockEGMClient.eventSubscriptions.listByResource).toBeCalledWith(
            'mockResourceGroup',
            'Microsoft.Media',
            'mediaservices',
            'mockAccountName'
        );
    });
    test('createOrUpdateEventSubscription() existing event subscription', async () => {
        await Subscription.createOrUpdateEventGridSubscription({}, 'subscriptionScope');
        expect(mockEGMClient.eventSubscriptions.createOrUpdate).not.toBeCalled();
    });
    test('createOrUpdateEventSubscription() new event subscription', async () => {
        await Subscription.createOrUpdateEventGridSubscription({}, 'subscriptionScope');
        const mockEventSubscriptionInfo = {
            destination: {
                endpointType: 'WebHook',
                endpointUrl: 'mockApiGatewayUrl',
                endpointBaseUrl: 'mockApiGatewayUrl'
            },
            filter: {
                includedEventTypes: ['Microsoft.Media.JobStateChange']
            }
        };
        expect(mockEGMClient.eventSubscriptions.createOrUpdate).toBeCalledWith(
            'subscriptionScope',
            'mockSubscriptionName',
            mockEventSubscriptionInfo
        );
    });
});
