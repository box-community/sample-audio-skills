// @flow

type Instances = {
    thumbnailsIds?: Array<string>,
    adjustedStart?: string,
    adjustedEnd?: string,
    start: string,
    end: string
}[];

type Transcripts = {
    id: number,
    text: string,
    confidence: number,
    speakerId: number,
    language: string,
    instances: Instances
}[];

type OCRs = {
    id: number,
    text: string,
    confidence: number,
    left: number,
    top: number,
    width: number,
    height: number,
    language: string,
    instances: Instances
}[];

type Keywords = {
    id: number,
    text: string,
    confidence: number,
    language: string,
    instances: Instances
}[];

type InsightDetails = {
    containerSasUrl: string,
    insights: {
        version: string,
        duration?: ?string,
        sourceLanguage: string,
        language: string,
        transcript?: Transcripts,
        keywords?: Keywords,
        ocr?: OCRs
    }
};

const map = require('lodash/map');
const slice = require('lodash/slice');
const url = require('url');

const MOST_NUMBER_OF_RELEVANT_FACES = 20;
const MOST_NUMBER_OF_RELEVANT_KEYWORDS = 25;
const CONFIDENCE_CUTOFF = 0.6; // 60%
const { LANGUAGE = 'en-US' } = process.env;

class AMSAdaptor {
    // these two functions are needed to be able to overload for unit test
    static getMostNumberOfRelevantKeywords() {
        return MOST_NUMBER_OF_RELEVANT_KEYWORDS;
    }

    static getMostNumberOfRelevantFaces() {
        return MOST_NUMBER_OF_RELEVANT_FACES;
    }
    /**
     * Gets base 64 encoded data URIs given containerSasUrl and thumbnailId.
     * @param {string} containerSasUrl - containerSasUrl
     * @param {string} thumbnailId - thumbnailId
     * @return {Object} - Promise object that resolves with data URI
     */
    static getAzureThumbnailURL(containerSasUrl: string, thumbnailId: string) {
        const parsedUrl = url.parse(containerSasUrl);
        const { host, pathname, search } = parsedUrl;
        const thumbnailName = `FaceThumbnail_${thumbnailId}.jpg`;
        return `https://${host}${pathname}/${thumbnailName}${search}`;
    }

    static convertTimeToSeconds(timestring: ?string) {
        if (!timestring) return null;
        const tt = timestring.split(':');
        return tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
    }

    // common function to map object of type Keywords/OCRs into array of Box keyword data
    static mapKeywordData(keywords: Keywords) {
        return map(keywords, (keyword) => ({
            text: keyword.text,
            appears: map(keyword.instances, (instance) => ({
                start: AMSAdaptor.convertTimeToSeconds(instance.start),
                end: AMSAdaptor.convertTimeToSeconds(instance.end)
            }))
        }));
    }
    static getTopicCards(skillsWriter: Object, ocr: OCRs, keywords: Keywords, duration: ?number) {
        const relevantOcr = slice(
            ocr
                // this is to prevent from reading gibberish characters in video as foreign words
                .filter((ocrWord) => ocrWord.confidence > CONFIDENCE_CUTOFF && ocrWord.language === LANGUAGE),
            0,
            this.getMostNumberOfRelevantKeywords()
        );

        const relevantKeywords = slice(
            keywords.filter(
                (keyword) =>
                    relevantOcr.indexOf(keyword) < 0 &&
                    keyword.confidence > CONFIDENCE_CUTOFF &&
                    keyword.language === LANGUAGE
            ),
            0,
            this.getMostNumberOfRelevantKeywords()
        );

        const ocrData = this.mapKeywordData(relevantOcr);
        const keywordData = this.mapKeywordData(relevantKeywords);
        return [
            skillsWriter.createTopicsCard(ocrData, duration, 'Text'),
            skillsWriter.createTopicsCard(keywordData, duration)
        ];
    }

    static getTranscriptsCard(skillsWriter: Object, transcript: Transcripts, duration: ?number) {
        const transcriptData = map(transcript, (line) => ({
            text: line.text,
            appears: map(line.instances, (instance) => ({
                start: this.convertTimeToSeconds(instance.start),
                end: this.convertTimeToSeconds(instance.end)
            }))
        }));
        return skillsWriter.createTranscriptsCard(transcriptData, duration);
    }

    /**
     * Converts the API result to the Metadata cards.
     * @param {Object} insightsDetails - video insightsDetails
     * @return {Array} metadataCards - array of metadata cards
     */
    static async getSkillMetadataCards(skillsWriter: Object,  insightsDetails: InsightDetails) {
        const { containerSasUrl, insights } = insightsDetails;
        // Order should be faces, text, topics, transcript
        const { faces = [], ocr = [], keywords = [], transcript = [], duration: timeTaken = '00:00:00' } = insights;
        const duration = this.convertTimeToSeconds(timeTaken);
        const cards = [
            ...this.getTopicCards(skillsWriter, ocr, keywords, duration),
            this.getTranscriptsCard(skillsWriter, transcript, duration)
        ];
        return { cards, duration };
    }
}
module.exports = AMSAdaptor;
