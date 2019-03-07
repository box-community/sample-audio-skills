/**
 * @fileoverview SpeechToText class implementation. It calls the IBM speech-to-text API to retrieve the intelligence results.
 * Then, it converts the data and stores the standardized metadata instances in box.
 */

/**
 * Module depdencies
 */

// @flow
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const Logger = require('./box/logger-manager');
const ErrorParser = require('./box/error-parser');

/**
 *  SpeechToText provides the function to create the asynchronous job for extracting the custom keywords.
 *  It also provides the function to retrive the result from the API once the processing is completed.
 */

class SpeechToText {

    /**
     * Creates the IBM speech-to-text recognition job.
     */
    static async createRecognitionJobCall(credentials, stream, contentType, encodedReturnObject, sampling) {
      // credentials is an obj having { username, password }
      const speechToText = new SpeechToTextV1(credentials);

      // Setup parameters to make recognition call
      // For IBM api documentation- https://www.ibm.com/watson/developercloud/speech-to-text/api/v1/?node#recognize_sessions_nonmp18
      const params = {
          audio: stream,
          content_type: `audio/${contentType}`,
          model: sampling === 'narrowband' ? 'en-US_NarrowbandModel' : 'en-US_BroadbandModel',
          callback_url: process.env.BOX_SKILLS_IBM_SPEECH_TO_TEXT_KEYWORDS_CALLBACK_ENDPOINT,
          user_token: encodedReturnObject,
          max_alternatives: 0, // we are only asking for one transcript, still returns as array of one
          interim_results: false, // only need final result not an array of interims
          word_confidence: false, // we don't need confidence measure 0-1 returned for every word
          speaker_labels: true, // speakers' breakdown is needed to get start-end transcript times
          timestamps: false, // we don't need time alignement for every word in the transcript
          profanity_filter: true,
          smart_formatting: true, // creates more readable dates, times, series of digits and numbers, phone numbers, currency values, and Internet addresses.
          events: ['recognitions.started', 'recognitions.completed_with_results', 'recognitions.failed'],
          results_ttl: process.env.BOX_SKILLS_IBM_SPEECH_TO_TEXT_RESULTS_TTL_MINUTES,
          'X-Watson-Learning-Opt-Out': true // don't let IBM train on our customer data
      };

      // Create the recognition job
      Logger.logInfo(`Creating IBM job with content_type: ${params.content_type} and model: ${params.model}`);
      return new Promise((resolve, reject) => {
          // The following job result does not print if the file size is too large and Watson
          // takes time in reading it. We always can get last 100 jobs with their user_token,
          // with a call to GET /v1/recognitions if debug is needed on if a job was created.
          speechToText.createJob(params, (jobError, job) => {
              if (jobError) {
                  Logger.logDebug(JSON.stringify(jobError));
                  const parsedError = new ErrorParser(JSON.stringify(jobError)).parseIBMSpeechToTextError().getSkillsErrorCode();
                  reject(parsedError);
              } else {
                  Logger.logInfo(`Job result: ${JSON.stringify(job, null, 2)}`);
                  resolve(job);
              }
          });
      });
  }
}
/** @module audio-ms-ibm-custom-skill-nodejs/ibm/speech-to-text */
module.exports = SpeechToText;
