/**
 * @fileoverview AudioAdaptor class implementation.
 */

// @flow
const get = require('lodash/get');
const findLast = require('lodash/findLast');
const last = require('lodash/last');
/**
 * AudioAdaptor is used convert the IBM Watson speech-to-text  result to the standardized metadata v2 cards.
 */

type Alternative = { transcript: string, timestamps: [], confidence: number };

type ResultsObject = {
    final: ?boolean,
    alternatives: ?Array<Alternative>
};

type RecognitionResponse = {
    result_index: number,
    speaker_labels: ?({
        speaker: number,
        confidence: number,
        final: boolean,
        from: number,
        to: number
    }[]),
    results: Array<ResultsObject>
};

class AudioAdaptor {
    /**
     * Function to get duration and set usage object
     * @param {Array} results list of transcript results
     * @return {number} duration
     */
    static getDuration(results: Array<ResultsObject>) {
        // Use time of latest transcribed word to estimate duration
        let lastResultWithTimestamp;
        // Find the last element of the results Array that has timestamps associated with it.
        // ex. result = {final: true, alternatives: [{ transcript: ' ', timestamps: [['%HESITATION', 1.9, 2.53]], confidence: 0.335 }]
        if (results.length !== 0) {
            lastResultWithTimestamp = findLast(results, (result) => result.alternatives[0].timestamps.length > 0);
        }
        // If a result exists with a timestamps array, return the timestamp for the end of the transcription parsed as an integer.
        return lastResultWithTimestamp ? parseFloat(last(lastResultWithTimestamp.alternatives[0].timestamps)[2], 10) : 1;
    }

    /**
     * Function to parse out the transcript times and text from IBM Watson speech-to-text
     * @param {Object} skillInvocations to access Metadata card template
     * @param {Array} results - an array of results objects with an alternatives property containing transcripts, confidence, and timestamps
     * @return {Object} transcript metdata card
     */
    static getTranscriptCard(skillWriter: Object, results: Array<ResultsObject>) {
        const defaultTimestamp = [['got', 0.0, 0.0], ['it', 0.0, 0.0]];
        const transcriptData = results.map((result) => ({
            text: get(result, 'alternatives[0].transcript', ''),
            appears: [
                {
                    start: get(result, 'alternatives[0].timestamps', defaultTimestamp)[0][1],
                    end: get(result, 'alternatives[0].timestamps', defaultTimestamp).pop()[2]
                }
            ]
        }));
        return skillWriter.createTranscriptsCard(transcriptData);
    }

    /**
     * Helper function to format the recognition response into different metadata cards.
     * @param {Object} skillWriter object to format metadata templates
     * @param {string} recognitionResponses - the classifications found by the Watson API in JSON format
     */
    static getSkillMetadataCards(skillWriter: Object, recognitionResponses: RecognitionResponse) {
        const { results } = recognitionResponses;
        return {
            cards: [AudioAdaptor.getTranscriptCard(skillWriter, results)],
            duration: AudioAdaptor.getDuration(results)
        };
    }
}

/** @module audio-ibm-watson-nodejs/ibm/audio-adaptor */
module.exports = AudioAdaptor;
