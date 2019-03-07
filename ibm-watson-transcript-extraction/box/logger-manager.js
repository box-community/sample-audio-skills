/* eslint-disable no-console */
/**
 * @fileoverview Manager for logging
 */

const moment = require('moment');

// Private
let requestId;
let fileId;

// private function to conver bytes into reader-friendly units
// upto one decimal place
const printBytesToSize = bytes => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'N/A';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${bytes / 1024 ** i} ${sizes[i]}`;
};

class Logger {
    /**
     * sets up request id for the session to be logged
     * @param {string} requestIdParam - skill request id
     * @param {string} fileIdParam - skill file id
     * @return {none} - no return
     */
    static setupLogger(requestIdParam, fileIdParam = '') {
        requestId = requestIdParam;
        fileId = fileIdParam;
    }

    /**
     * Gets request id for the session to be logged
     * @return {string} - requestId
     */
    static getRequestId() {
        return requestId;
    }

    /**
     * Logs the info message with requestId prefix for tracking
     * @param {string} message - info message to be logged
     * @return {none} - no return
     */
    static logInfo(message) {
        console.info(`[${fileId} | ${requestId}] ${message}`);
    }

    /**
     * Logs the warning message with requestId prefix for tracking
     * @param {string} message - warning message to be logged
     * @return {none} - no return
     */
    static logWarning(message) {
        console.warn(`[${fileId} | ${requestId}] ${message}`);
    }

    /**
     * Logs stack trace with requestId prefix for tracking
     * @param {string} message - error message to be logged
     * @return {none} - no return
     */
    static logError(message = 'ERROR') {
        console.error(`[${fileId} | ${requestId}] ${message}`);
    }

    /**
     * Logs stack trace with requestId prefix for tracking
     * @param {string} message - error message to be logged
     * @return {none} - no return
     */
    static logDebug(message = 'DEBUG') {
        if (process.env.DEBUG === 'true') {
            console.info(`[${fileId} | ${requestId}] ${message}`);
        }
    }

    /**
     * Logs final skill success message with file format, file size and processing time taken
     * eg. print: SKILL SUCCESS [MP4 | 2.4 MB | 2 MINUTES ]
     * @param {Object} fileContext - error message to be logged
     * @param {number} jobCreatedTime - start time for when ML processing was invoked
     * @return {none} - no return
     */
    static logSkillSuccess(fileContext, jobCreatedTime = Date.now()) {
        this.logInfo(
            `SKILL SUCCESS [${fileContext.fileFormat.toUpperCase()} | ${printBytesToSize(
                fileContext.fileSize
            )} | ${moment(jobCreatedTime)
                .fromNow('hh:mm:ss')
                .toUpperCase()} ]`
        );
    }
}

module.exports = Logger;
