// @flow

/**
 * @fileoverview AMSSubscription interfaces with the Microsoft Azure event grid using the node SDK.
 * 1) Determines if an event grid subscription with the correct properties already exists.
 * 2) Creates a new subscription if one does not already exist.
 * 3) Contains functions to delete existing event grid subcriptions and list all exisiting event grid subscriptions.
 * reference: (https://docs.microsoft.com/en-us/javascript/api/azure-arm-eventgrid/eventsubscriptions?view=azure-node-latest)
 */

const Logger = require('box-basic-skills-kit/logger-manager');
const EventGridManagementClient = require('azure-arm-eventgrid');

const PROVIDER_NAMESPACE = 'Microsoft.Media';
const RESOURCE_TYPE_NAME = 'mediaservices';
const AZURE_EVENT_SUBSCRIPTION_ENDPOINT_TYPE = 'WebHook';
const AZURE_MEDIA_JOB_STATE_CHANGE_EVENT = 'Microsoft.Media.JobStateChange';

class AMSSubscription {
    subscriptionId: string;
    accountName: string;
    apiGatewayURL: string;
    resourceGroup: string;
    subscriptionName: string;
    EGMClient: Object;

    constructor(
        subscriptionId: string,
        accountName: string,
        apiGatewayURL: string,
        resourceGroup: string,
        subscriptionName: string
    ) {
        this.subscriptionId = subscriptionId;
        this.accountName = accountName;
        this.apiGatewayURL = apiGatewayURL;
        this.resourceGroup = resourceGroup;
        this.subscriptionName = subscriptionName;
    }

    setEventGridManagementClient(credentials: Object) {
        this.EGMClient = new EventGridManagementClient(credentials, this.subscriptionId);
        this.EGMClient.apiVersion = '2018-05-01-preview';
    }

    // Function to delete an existing event grid subscriptions
    async deleteEventGridSubscription(credentials: Object, subscriptionScope: string, subscriptionName: string) {
        this.setEventGridManagementClient(credentials);
        await this.EGMClient.eventSubscriptions.deleteMethod(subscriptionScope, subscriptionName);
    }

    // Function to list all existing event grid subscriptions
    async listExistingEventGridSubscriptions(credentials: Object) {
        this.setEventGridManagementClient(credentials);
        const existingSubscriptions = await this.EGMClient.eventSubscriptions.listByResource(
            this.resourceGroup,
            PROVIDER_NAMESPACE,
            RESOURCE_TYPE_NAME,
            this.accountName
        );
        return existingSubscriptions;
    }

    async createOrUpdateEventGridSubscription(credentials: Object, subscriptionScope: string) {
        const eventSubscriptionInfo = {
            destination: {
                endpointType: AZURE_EVENT_SUBSCRIPTION_ENDPOINT_TYPE,
                endpointUrl: this.apiGatewayURL,
                endpointBaseUrl: this.apiGatewayURL
            },
            filter: {
                includedEventTypes: [AZURE_MEDIA_JOB_STATE_CHANGE_EVENT]
            }
        };
        this.setEventGridManagementClient(credentials);
        try {
            // Check if event subscription already exists
            await this.EGMClient.eventSubscriptions.get(subscriptionScope, this.subscriptionName);
        } catch (err) {
            Logger.logInfo(`${err} - Creating a new eventGridSubscription.`);
            // Create or update subscription
            await this.EGMClient.eventSubscriptions.createOrUpdate(
                subscriptionScope,
                this.subscriptionName,
                eventSubscriptionInfo
            );
            Logger.logInfo('New Azure event grid subscription created');
        }
    }
}

module.exports = AMSSubscription;
