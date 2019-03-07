const AMSAdaptor = require('./../ams-adaptor');
const { SkillsWriter } = require('box-basic-skills-kit/skills-kit-2.0');

const mockDateValue = new Date().toISOString();
const boxId = '123';
const skillId = 'mockSkillId';
const fileId = 'mockfileId';
const writeToken = 'mockWriteToken';
const mockURI = 'mockURI';
const skillsWriter = new SkillsWriter({ requestId: boxId, skillId, fileId, fileWriteToken: writeToken });

process.env.LANGUAGE = 'en-US';
const insightsDetails = {
    containerSasUrl: 'mockUrl',
    insights: {
        version: '0.9.0.0',
        duration: '0:01:14.655',
        sourceLanguage: 'en-US',
        language: 'en-US',
        transcript: [
            {
                id: 0,
                text: 'I was gonna ask you to explain quantum computing better.',
                confidence: 0,
                speakerId: 0,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:00',
                        end: '0:00:05'
                    }
                ]
            },
            {
                id: 1,
                text:
                    'When do you expect Canada zeisel mission to begin again hand are we not doing anything in the interim?',
                confidence: 0,
                speakerId: 0,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:05',
                        end: '0:00:12.55'
                    }
                ]
            },
            {
                id: 2,
                text: 'Well we prepare. OK. Very simply normal computers work bye.',
                confidence: 0,
                speakerId: 0,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:12.55',
                        end: '0:00:19.53'
                    }
                ]
            }
        ],
        ocr: [
            {
                id: 0,
                text: 'Here\'s How',
                confidence: 0.9138,
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                language: 'en-US',
                instances: [
                    {
                        adjustedStart: '0:00:00.934',
                        adjustedEnd: '0:00:03.27',
                        start: '0:00:00.934',
                        end: '0:00:03.27'
                    }
                ]
            },
            {
                id: 0,
                text: 'japanese text',
                confidence: 0.9138,
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                language: 'jp-JP',
                instances: [
                    {
                        adjustedStart: '0:00:00.934',
                        adjustedEnd: '0:00:03.27',
                        start: '0:00:00.934',
                        end: '0:00:03.27'
                    }
                ]
            }
        ],
        faces: [
            {
                id: 1925,
                name: '',
                confidence: 0,
                thumbnailId: 'e257fc9c-004b-4df1-a40f-f709977299f1',
                instances: [
                    {
                        start: '0:00:50.45',
                        end: '0:00:53.82'
                    },
                    {
                        thumbnailsIds: ['04531b77-0a70-4e40-8ab1-a31fa6e71d5b'],
                        start: '0:00:59.86',
                        end: '0:01:04.23'
                    },
                    {
                        start: '0:01:12.506',
                        end: '0:01:14.307'
                    }
                ]
            },
            {
                id: 2115,
                name: '',
                confidence: 0,
                thumbnailId: 'c5635124-291b-4617-83bd-0dd32f17e656',
                instances: [
                    {
                        start: '0:01:14.408',
                        end: '0:01:14.441'
                    }
                ]
            }
        ]
    }
};

const facesCard = {
    created_at: mockDateValue,
    type: 'skill_card',
    skill: { type: 'service', id: 'mockSkillId' },
    skill_card_type: 'timeline',
    skill_card_title: { code: 'skills_faces', message: 'Faces' },
    invocation: { type: 'skill_invocation', id: '123' },
    status: {},
    entries: [
        {
            type: 'image',
            text: 'Unknown #1',
            image_url: 'https://nullmockUrl/FaceThumbnail_e257fc9c-004b-4df1-a40f-f709977299f1.jpgnull',
            appears: [{ start: 50.45, end: 53.82 }, { start: 59.86, end: 64.23 }, { start: 72.506, end: 74.307 }]
        },
        {
            type: 'image',
            text: 'Unknown #2',
            image_url: 'https://nullmockUrl/FaceThumbnail_c5635124-291b-4617-83bd-0dd32f17e656.jpgnull',
            appears: [{ start: 74.408, end: 74.441 }]
        }
    ],
    duration: 74.655
};

const ocrCard = {
    created_at: mockDateValue,
    type: 'skill_card',
    skill: { type: 'service', id: 'mockSkillId' },
    skill_card_type: 'keyword',
    skill_card_title: { code: 'skills_text', message: 'Text' },
    invocation: { type: 'skill_invocation', id: '123' },
    status: {},
    entries: [
        {
            appears: [
                {
                    end: 3.27,
                    start: 0.934
                }
            ],
            text: 'Here\'s How',
            type: 'text'
        }
    ],
    duration: 74.655
};

const transcriptCard = {
    created_at: mockDateValue,
    type: 'skill_card',
    skill_card_type: 'transcript',
    skill: {
        type: 'service',
        id: 'mockSkillId'
    },
    invocation: {
        type: 'skill_invocation',
        id: boxId
    },
    status: {},
    skill_card_title: {
        code: 'skills_transcript',
        message: 'Transcript'
    },
    duration: 74.655,
    entries: [
        {
            type: 'text',
            text: 'I was gonna ask you to explain quantum computing better.',
            appears: [
                {
                    start: 0,
                    end: 5
                }
            ]
        },
        {
            type: 'text',
            text:
                'When do you expect Canada zeisel mission to begin again hand are we not doing anything in the interim?',
            appears: [
                {
                    start: 5,
                    end: 12.55
                }
            ]
        },
        {
            type: 'text',
            text: 'Well we prepare. OK. Very simply normal computers work bye.',
            appears: [
                {
                    start: 12.55,
                    end: 19.53
                }
            ]
        }
    ]
};

const { insights } = insightsDetails;
const { duration: jsonDuration } = insights;

describe('AMSAdapator', () => {
    test('getSkillMetadataCards with less than max number of keywords above .6', async () => {
        expect.assertions(1);
        const keywordCard = {
            created_at: mockDateValue,
            type: 'skill_card',
            skill: { type: 'service', id: 'mockSkillId' },
            skill_card_type: 'keyword',
            skill_card_title: { code: 'skills_topics', message: 'Topics' },
            invocation: { type: 'skill_invocation', id: '123' },
            status: {},
            entries: [
                {
                    appears: [
                        {
                            end: 46.67,
                            start: 37.7
                        },
                        {
                            end: 56.35,
                            start: 46.67
                        }
                    ],
                    text: 'quantum state',
                    type: 'text'
                }
            ],
            duration: 74.655
        };
        const keywords = [
            {
                id: 0,
                text: 'quantum state',
                confidence: 0.75,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:37.7',
                        end: '0:00:46.67'
                    },
                    {
                        start: '0:00:46.67',
                        end: '0:00:56.35'
                    }
                ]
            },
            {
                id: 1,
                text: 'quantum computing',
                confidence: 0.25,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:00',
                        end: '0:00:05'
                    },
                    {
                        start: '0:00:56.35',
                        end: '0:01:05.91'
                    }
                ]
            },
            {
                id: 2,
                text: 'quantum',
                confidence: 0.85,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:00',
                        end: '0:00:05'
                    },
                    {
                        start: '0:00:37.7',
                        end: '0:00:46.67'
                    },
                    {
                        start: '0:00:46.67',
                        end: '0:00:56.35'
                    },
                    {
                        start: '0:00:56.35',
                        end: '0:01:05.91'
                    }
                ]
            }
        ];

        // eslint-disable-next-line no-param-reassign
        insightsDetails.insights.keywords = keywords;
        AMSAdaptor.getMostNumberOfRelevantKeywords = jest.fn().mockReturnValue(1);
        const data = await AMSAdaptor.getSkillMetadataCards(skillsWriter, false, insightsDetails);
        data.cards.forEach((card) => {
            // eslint-disable-next-line no-param-reassign
            card.created_at = mockDateValue;
        });
        expect(data).toEqual({ cards: [facesCard, ocrCard, keywordCard, transcriptCard], duration: 74.655 });
    });

    test('getSkillMetadataCards with more than max number of keywords above .6', async () => {
        expect.assertions(1);
        const keywordCard = {
            created_at: mockDateValue,
            type: 'skill_card',
            skill: { type: 'service', id: 'mockSkillId' },
            skill_card_type: 'keyword',
            skill_card_title: { code: 'skills_topics', message: 'Topics' },
            invocation: { type: 'skill_invocation', id: '123' },
            status: {},
            entries: [
                {
                    appears: [
                        {
                            end: 46.67,
                            start: 37.7
                        },
                        {
                            end: 56.35,
                            start: 46.67
                        }
                    ],
                    text: 'quantum state',
                    type: 'text'
                }
            ],
            duration: 74.655
        };
        const keywords = [
            {
                id: 0,
                text: 'quantum state',
                confidence: 0.75,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:37.7',
                        end: '0:00:46.67'
                    },
                    {
                        start: '0:00:46.67',
                        end: '0:00:56.35'
                    }
                ]
            },
            {
                id: 1,
                text: 'quantum computing',
                confidence: 0.75,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:00',
                        end: '0:00:05'
                    },
                    {
                        start: '0:00:56.35',
                        end: '0:01:05.91'
                    }
                ]
            },
            {
                id: 2,
                text: 'quantum',
                confidence: 0.85,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:00',
                        end: '0:00:05'
                    },
                    {
                        start: '0:00:37.7',
                        end: '0:00:46.67'
                    },
                    {
                        start: '0:00:46.67',
                        end: '0:00:56.35'
                    },
                    {
                        start: '0:00:56.35',
                        end: '0:01:05.91'
                    }
                ]
            }
        ];
        insightsDetails.insights.keywords = keywords;
        const ocrBackup = insightsDetails.insights.ocr;
        // eslint-disable-next-line no-param-reassign
        AMSAdaptor.getMostNumberOfRelevantKeywords = jest.fn().mockReturnValue(1);
        // AMSAdaptor.skillsWriter = skillsWriter;
        // console.log(`keywordsss ${AMSAdaptor.getTopicCards([], keywords, null)}`);
        //  AMSAdaptor.getBase64URIFromURL = jest.fn().mockReturnValue(mockURI);
        const data = await AMSAdaptor.getSkillMetadataCards(skillsWriter, false, insightsDetails);
        data.cards.forEach((card) => {
            // eslint-disable-next-line no-param-reassign
            card.created_at = mockDateValue;
        });
        insightsDetails.insights.ocr = ocrBackup; // restore back old ocr value
        expect(data).toEqual({ cards: [facesCard, ocrCard, keywordCard, transcriptCard], duration: 74.655 });
    });

    test('getSkillMetadataCards with no keywords above .6', async () => {
        expect.assertions(1);
        const keywordCard = {
            created_at: mockDateValue,
            type: 'skill_card',
            skill_card_type: 'keyword',
            skill: {
                type: 'service',
                id: 'mockSkillId'
            },
            invocation: {
                type: 'skill_invocation',
                id: boxId
            },
            status: {},
            skill_card_title: {
                code: 'skills_topics',
                message: 'Topics'
            },
            duration: 74.655,
            entries: []
        };
        const keywords = [
            {
                id: 0,
                text: 'quantum state',
                confidence: 0.1,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:37.7',
                        end: '0:00:46.67'
                    },
                    {
                        start: '0:00:46.67',
                        end: '0:00:56.35'
                    }
                ]
            },
            {
                id: 1,
                text: 'quantum computing',
                confidence: 0.1,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:00',
                        end: '0:00:05'
                    },
                    {
                        start: '0:00:56.35',
                        end: '0:01:05.91'
                    }
                ]
            },
            {
                id: 2,
                text: 'quantum',
                confidence: 0.1,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:00',
                        end: '0:00:05'
                    },
                    {
                        start: '0:00:37.7',
                        end: '0:00:46.67'
                    },
                    {
                        start: '0:00:46.67',
                        end: '0:00:56.35'
                    },
                    {
                        start: '0:00:56.35',
                        end: '0:01:05.91'
                    }
                ]
            }
        ];
        insightsDetails.insights.keywords = keywords;
        AMSAdaptor.getMostNumberOfRelevantKeywords = jest.fn().mockReturnValue(1);
        AMSAdaptor.getBase64URIFromURL = jest.fn().mockReturnValue(mockURI);
        const data = await AMSAdaptor.getSkillMetadataCards(skillsWriter, false, insightsDetails);
        data.cards.forEach((card) => {
            // eslint-disable-next-line no-param-reassign
            card.created_at = mockDateValue;
        });
        expect(data).toEqual({ cards: [facesCard, ocrCard, keywordCard, transcriptCard], duration: 74.655 });
    });
    test('getSkillMetadataCards for audio with less than max number of keywords above .6', async () => {
        expect.assertions(1);
        const keywordCard = {
            created_at: mockDateValue,
            type: 'skill_card',
            skill_card_type: 'keyword',
            skill: {
                type: 'service',
                id: 'mockSkillId'
            },
            invocation: {
                type: 'skill_invocation',
                id: boxId
            },
            status: {},
            skill_card_title: {
                code: 'skills_topics',
                message: 'Topics'
            },
            duration: 74.655,
            entries: [
                {
                    appears: [
                        {
                            end: 46.67,
                            start: 37.7
                        },
                        {
                            end: 56.35,
                            start: 46.67
                        }
                    ],
                    text: 'quantum state',
                    type: 'text'
                }
            ]
        };
        const keywords = [
            {
                id: 0,
                text: 'quantum state',
                confidence: 0.75,
                language: 'en-US',
                instances: [
                    {
                        start: '0:00:37.7',
                        end: '0:00:46.67'
                    },
                    {
                        start: '0:00:46.67',
                        end: '0:00:56.35'
                    }
                ]
            }
        ];
        // eslint-disable-next-line no-param-reassign
        insightsDetails.insights.keywords = keywords;
        AMSAdaptor.getMostNumberOfRelevantKeywords = jest.fn().mockReturnValue(3);
        AMSAdaptor.getBase64URIFromURL = jest.fn().mockReturnValue(mockURI);
        const data = await AMSAdaptor.getSkillMetadataCards(skillsWriter, true, insightsDetails);
        data.cards.forEach((card) => {
            // eslint-disable-next-line no-param-reassign
            card.created_at = mockDateValue;
        });
        expect(data).toEqual({ cards: [ocrCard, keywordCard, transcriptCard], duration: 74.655 });
    });
    test('getSkillMetadataCards with no duration in insight details', async () => {
        expect.assertions(1);
        const keywordCardWithoutDuration = {
            created_at: mockDateValue,
            type: 'skill_card',
            skill: { type: 'service', id: 'mockSkillId' },
            skill_card_type: 'keyword',
            skill_card_title: { code: 'skills_topics', message: 'Topics' },
            invocation: { type: 'skill_invocation', id: '123' },
            status: {},
            entries: [
                {
                    text: 'quantum state',
                    type: 'text',
                    appears: [
                        {
                            start: 37.7,
                            end: 46.67
                        },
                        {
                            start: 46.67,
                            end: 56.35
                        }
                    ]
                }
            ]
        };
        const facesCardWithoutDuration = {
            created_at: mockDateValue,
            type: 'skill_card',
            skill: { type: 'service', id: 'mockSkillId' },
            skill_card_type: 'timeline',
            skill_card_title: { code: 'skills_faces', message: 'Faces' },
            invocation: { type: 'skill_invocation', id: '123' },
            status: {},
            entries: [
                {
                    type: 'image',
                    text: 'Unknown #1',
                    image_url: 'https://nullmockUrl/FaceThumbnail_e257fc9c-004b-4df1-a40f-f709977299f1.jpgnull',
                    appears: [
                        { start: 50.45, end: 53.82 },
                        { start: 59.86, end: 64.23 },
                        { start: 72.506, end: 74.307 }
                    ]
                },
                {
                    type: 'image',
                    text: 'Unknown #2',
                    image_url: 'https://nullmockUrl/FaceThumbnail_c5635124-291b-4617-83bd-0dd32f17e656.jpgnull',
                    appears: [{ start: 74.408, end: 74.441 }]
                }
            ]
        };

        const transcriptCardWithoutDuration = {
            created_at: mockDateValue,
            type: 'skill_card',
            skill: { type: 'service', id: 'mockSkillId' },
            skill_card_type: 'transcript',
            skill_card_title: { code: 'skills_transcript', message: 'Transcript' },
            invocation: { type: 'skill_invocation', id: '123' },
            status: {},
            entries: [
                {
                    text: 'I was gonna ask you to explain quantum computing better.',
                    appears: [{ start: 0, end: 5 }],
                    type: 'text'
                },
                {
                    text:
                        'When do you expect Canada zeisel mission to begin again hand are we not doing anything in the interim?',
                    appears: [{ start: 5, end: 12.55 }],
                    type: 'text'
                },
                {
                    text: 'Well we prepare. OK. Very simply normal computers work bye.',
                    appears: [{ start: 12.55, end: 19.53 }],
                    type: 'text'
                }
            ]
        };

        const ocrCardWithoutDuration = {
            created_at: mockDateValue,
            type: 'skill_card',
            skill: { type: 'service', id: 'mockSkillId' },
            skill_card_type: 'keyword',
            skill_card_title: { code: 'skills_text', message: 'Text' },
            invocation: { type: 'skill_invocation', id: '123' },
            status: {},
            entries: [
                {
                    appears: [
                        {
                            end: 3.27,
                            start: 0.934
                        }
                    ],
                    text: 'Here\'s How',
                    type: 'text'
                }
            ]
        };

        delete insightsDetails.insights.duration;
        AMSAdaptor.getMostNumberOfRelevantKeywords = jest.fn().mockReturnValue(1);
        AMSAdaptor.getBase64URIFromURL = jest.fn().mockReturnValue(mockURI);
        const data = await AMSAdaptor.getSkillMetadataCards(skillsWriter, false, insightsDetails);
        data.cards.forEach((card) => {
            // eslint-disable-next-line no-param-reassign
            card.created_at = mockDateValue;
        });
        expect(data).toEqual({
            cards: [
                facesCardWithoutDuration,
                ocrCardWithoutDuration,
                keywordCardWithoutDuration,
                transcriptCardWithoutDuration
            ],
            duration: 0
        });
    });

    test('convertTimeToSeconds', () => {
        const data = AMSAdaptor.convertTimeToSeconds(jsonDuration);
        expect(data).toEqual(74.655);
    });
});
