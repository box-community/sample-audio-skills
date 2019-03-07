/**
 * @fileoverview The lambda handler.
 */

/**
 * Module dependencies
 */

// @flow
const SpeechToText = require('./ibm/speech-to-text');
const AudioAdaptor = require('./ibm/audio-adaptor');
const Logger = require('./box/logger-manager');
const BoxEventManager = require('./box/box-event-manager');
const EncryptionManager = require('./box/encryption-manager');
const HMACManager = require('./box/hmac-manager');
const util = require('util');
const { FilesReader, SkillsWriter, SkillsErrorEnum } = require('./box/skills-kit-2.0');

const getCredentials = (scalar) => {
  const { username, password } = JSON.parse(scalar);
  if (!username || !password) {
      const missingSpeechToTextCredentials = [];
      if (!username) missingSpeechToTextCredentials.push('username');
      if (!password) missingSpeechToTextCredentials.push('password');
      Logger.logError(`Missing IBM Watson details: ${JSON.stringify(missingSpeechToTextCredentials)}`);
      throw new Error(SkillsErrorEnum.INVALID_EVENT);
  }
  return { username, password };
}

/**
 * Main function processing a box event to make IBM speech-to-text call
 *
 * @param filesReader - obj created from event.body of box request call.
 * @param getBackObj - obj containing { eventBodyObj, sampling }
 */
const processBoxEventForWatsonAudio = async (filesReader: Object, getBackObj: Object) => {
  const { box_internal_config: boxInternalConfig } = getBackObj.eventBodyObj;
  const credentials = getCredentials(boxInternalConfig.scalar);
  const encodedReturnObject = EncryptionManager.encrypt(process.env.SYMMETRIC_ENCRYPTION_KEY, JSON.stringify(getBackObj));

  let stream = null;
  let fileFormat = null;
  if(process.env.SKILL_USE_ORIGINAL_FILE_FOR.includes(filesReader.getFileContext().fileFormat)){
    stream = await filesReader.getContentStream();
    //if using original file format, pass down the extenstion of the original file
    fileFormat = filesReader.getFileContext().fileFormat;
  }else{
    stream = await filesReader.getBasicFormatContentStream();
    // using basic format, file is converted to mp3 format
    fileFormat = 'mp3';
  }
  Logger.logInfo(`Uploading file to IBM Watson Audio for sampling ${getBackObj.sampling}`);
  await SpeechToText.createRecognitionJobCall(credentials, stream, fileFormat, encodedReturnObject, getBackObj.sampling);
};

/**
 * Main function processing a IBM speech-to-text response event into writing metadata cards
 *
 * @param skillsWriter - obj created through  returned and decoded pass-back object
 * @param responses - array of 'recognition results' received back
 */
const processWatsonAudioResults = async (skillsWriter: Object, responses: Array) => {
    const { cards, duration } = AudioAdaptor.getSkillMetadataCards(
        skillsWriter,
        responses[0] // we configured to send only one response obj
    );
    Logger.logInfo('Audio recognitions converted to skills metadata cards');
    Logger.logDebug(`Cards created: ${JSON.stringify(cards)}, total duration ${duration}`);
    await skillsWriter.saveDataCards(cards, null, null, { unit: 'seconds', value: duration });
};

const handleRegistrationCallback = (event, callback) => {
    const { headers: { 'x-callback-signature': signedHMACToken }, queryStringParameters: { challenge_string: challengeString }} = event;
    if (!HMACManager.validateSignedToken(signedHMACToken, challengeString, process.env.SIGNATURE_HASH_KEY)) {
        Logger.logError('Security Error: Invalid signed HMAC token for registration callback.');
        return;
    }
    Logger.logDebug('HMAC token validated for IBM registration callback response');
    callback(null, { statusCode: 200, headers: { 'content-type': 'text/plain'}, body: event.queryStringParameters.challenge_string});
};

const handleIBMEvent = async (event) => {
    Logger.logDebug(`IBM response recieved ${JSON.stringify(event)}`);
    const { headers: { 'x-callback-signature': signedHMACToken }, body } = event;

    // Validate IBM body integrity, and authenticate sender using HMAC cryptographic hashing.
    if (!signedHMACToken) {
        Logger.logError('Security Error: HMAC token for IBM not present');
    }
    if (signedHMACToken && !HMACManager.validateSignedToken(signedHMACToken, body, process.env.SIGNATURE_HASH_KEY)) {
        Logger.logError('Security Error: Invalid signed HMAC token for IBM audio breakdown callback.');
        return;
    }

    let skillsWriter;
    try {
      const { id, user_token: encryptedUserToken, event: callbackEvent, results } = JSON.parse(body);
      const getBackObjStr = EncryptionManager.decrypt(process.env.SYMMETRIC_ENCRYPTION_KEY, encryptedUserToken);
      const { eventBodyObj , sampling } = JSON.parse( getBackObjStr );
      const { id : boxId, source: { id : fileId} } = eventBodyObj
      Logger.setupLogger(boxId, fileId);
      const filesReader = new FilesReader(JSON.stringify(eventBodyObj))
      skillsWriter = new SkillsWriter(filesReader.getFileContext());

      if (callbackEvent === 'recognitions.started') {
            Logger.logDebug(`Job id: [${id}] created, recognitions started`);
      } else if (callbackEvent === 'recognitions.failed' && sampling === 'broadband') {
            // the only way to solve sampling rate issue for now is to try as lower bandwidth if higher fails
            Logger.logInfo('The file didnt work at broadband sampling, trying narrowband config');
            await processBoxEventForWatsonAudio(filesReader, { eventBodyObj, sampling :'narrowband'});
        } else if (callbackEvent === 'recognitions.completed_with_results') {
            Logger.logDebug(`Results recieved: ${JSON.stringify(results)}`);
            await processWatsonAudioResults(skillsWriter, results);
        } else if (callbackEvent === 'recognitions.failed') {
            Logger.logError(`Recognition job with id: [${id}] failed !!`);
            throw new Error(SkillsErrorEnum.FILE_PROCESSING_ERROR); // IBM doesn't return specific error codes.
        } else {
            Logger.logError(`Unknown Watson status ${callbackEvent}`);
        }
    } catch (error) {
        Logger.logError(`Catching IBM response exception ${error.message}`);
        if (skillsWriter) await skillsWriter.saveErrorCard(error.message);
    }
};

/**
 * This is the main function that the Lamba will call when invoked.
 *
 * @param event - data from the event, including the payload of the webhook, that triggered this function call
 * @param context - additional context information from the request (unused in this example)
 * @param callback - the function to call back to once finished
 */
const handler = async (event: Object, context: Object, callback: Function) => {
    // Process call back registration URL from IBM Watson. The registration call is made from
    // outside this lambda code (in Jenkins). It happens one-time whenever the service is deployed.
    // IBM documentation states that once a callback is registered,
    // it doesn't expire, unless it is un-registered.
    if (event.httpMethod === 'GET') {
        handleRegistrationCallback(event, callback);
        return;
    }
    const { body } = event;
    if (!body) {
        Logger.logError('Missing event body in non-registration callback event');
        return;
    }
    const { id, user_token: encryptedUserToken, event: callbackEvent } = JSON.parse(body);
    if (id && encryptedUserToken && callbackEvent) {
        await handleIBMEvent(event);
    } else {
        // If it is not an IBM event, it's an event from Box and should be handled as new skill request
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
                username : process.env.SPEECH_TO_TEXT_USERNAME,
                password: process.env.SPEECH_TO_TEXT_PASSWORD
              }

              const getBackObj = { eventBodyObj : JSON.parse(event.body) , sampling : 'broadband'}
              await processBoxEventForWatsonAudio(filesReader, getBackObj);
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

module.exports = { handler };
