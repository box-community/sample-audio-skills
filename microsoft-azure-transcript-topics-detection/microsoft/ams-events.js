// @flow

/**
 * @fileoverview AMSEvents handles all incoming MS Azure Events.
 * Provides functions used in index.js to determine the type of MS Azure Event being recieved and respond appropiately.
 */

const startsWith = require('lodash/startsWith');

// Microsoft events
const AZURE_MEDIA_JOB_STATE_CHANGE_EVENT = 'Microsoft.Media.JobStateChange';
const AZURE_MEDIA_FINISHED_JOB_STATE = 'Finished';
const AZURE_MEDIA_CANCELED_JOB_STATE = 'Canceled';
const AZURE_MEDIA_ERROR_JOB_STATE = 'Error';
const AZURE_EVENTGRID_SUBSCRIPTION_VALIDATION_EVENT = 'Microsoft.EventGrid.SubscriptionValidationEvent';
const AZURE_EVENTGRID_SUBSCRIPTION_DELETION_EVENT = 'Microsoft.EventGrid.SubscriptionDeletedEvent';

class AMSEvents {
    static isMicrosoftAzureEvent(eventBody: Array<Object> | Object) {
        return eventBody && eventBody[0] && startsWith(eventBody[0].eventType, 'Microsoft');
    }

    static isAzureSubscriptionDeletionEvent(eventBody: Array<Object>) {
        return eventBody[0].eventType === AZURE_EVENTGRID_SUBSCRIPTION_DELETION_EVENT;
    }

    static isAzureSubscriptionValidationEvent(eventBody: Array<Object>) {
        return eventBody[0].data && eventBody[0].eventType === AZURE_EVENTGRID_SUBSCRIPTION_VALIDATION_EVENT;
    }

    static isAzureMediaFinishedJobStateChangeEvent(eventBody: Array<Object>) {
        return (
            eventBody[0].eventType === AZURE_MEDIA_JOB_STATE_CHANGE_EVENT &&
            eventBody[0].data.state === AZURE_MEDIA_FINISHED_JOB_STATE
        );
    }

    static isAzureMediaCanceledJobStateChangeEvent(eventBody: Array<Object>) {
        return (
            eventBody[0].eventType === AZURE_MEDIA_JOB_STATE_CHANGE_EVENT &&
            eventBody[0].data.state === AZURE_MEDIA_CANCELED_JOB_STATE
        );
    }

    static isAzureMediaErrorJobStateChangeEvent(eventBody: Array<Object>) {
        return (
            eventBody[0].eventType === AZURE_MEDIA_JOB_STATE_CHANGE_EVENT &&
            eventBody[0].data.state === AZURE_MEDIA_ERROR_JOB_STATE
        );
    }

    static getAzureSubscriptionValidationResponse(eventBody: Array<Object>) {
        return JSON.stringify({
            validationResponse: eventBody[0].data.validationCode
        });
    }
}

module.exports = AMSEvents;
