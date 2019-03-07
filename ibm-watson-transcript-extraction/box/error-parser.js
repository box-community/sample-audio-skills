/**
 * @fileoverview ErrorParser manages transformation for error messages caught from any of the external APIs into
 * skill specific error message.
 */

/**
 * Module dependencies
 */
const { SkillsErrorEnum } = require('./skills-kit-2.1');

class ErrorParser {
    constructor(error) {
        this.error = error;

        // for known errors set the final skillsErrorCode for error metadata card value as it is
        this.skillsErrorCode =
            this.error === SkillsErrorEnum.INVALID_FILE_SIZE ||
            this.error === SkillsErrorEnum.INVALID_FILE_FORMAT ||
            this.error === SkillsErrorEnum.INVALID_EVENT
                ? this.error
                : SkillsErrorEnum.UNKNOWN;
    }

    parseBoxSkillsInvocationError() {
        // error in skill invocation calls for saving metadata cards
        if (this.error.includes('Unexpected API Response')) {
            // internal server errors are reserved to something going wrong run-time on skill's own lambda/server
            // it should not be extended to errors happening with external MLP provider
            // create a seperate function to be chained for MLP errors.

            this.skillsErrorCode = SkillsErrorEnum.INVOCATIONS_ERROR;
        }

        return this;
    }

    parseIBMSpeechToTextError() {
        if (this.error.includes('Unsupported Media Type') || this.error.includes('callback url not registered')) {
            this.skillsErrorCode = SkillsErrorEnum.FILE_PROCESSING_ERROR;
        }
        if (this.error.includes('Unauthorized')) {
            // full error : 'Unauthorized: Access is denied due to invalid credentials.'
            this.skillsErrorCode = SkillsErrorEnum.EXTERNAL_AUTH_ERROR;
        }
        return this;
    }
}

module.exports = ErrorParser;
