const AudioAdaptor = require('../audio-adaptor');
const { SkillsWriter } = require('box-basic-skills-kit/skills-kit-2.0');

const SKILLS_SERVICE_TYPE = 'service';
const SKILLS_METADATA_CARD_TYPE = 'skill_card';
const SKILLS_METADATA_INVOCATION_TYPE = 'skill_invocation';
const mockDateValue = new Date().toISOString();

describe('AudioAdaptor', () => {
    const skillId = '123';
    const writeToken = 'mockWriteToken';
    const fileId = 'mockFileId';
    const boxId = 'mockBoxId';
    const skillWriter = new SkillsWriter({ requestId: boxId, skillId, fileId, fileWriteToken: writeToken });

    test('getSkillMetadataCards()', () => {
        // eslint-disable-next-line require-jsdoc

        /* eslint-disable quotes */
        const response = {
            result_index: 0,
            speaker_labels: [
                {
                    speaker: 1,
                    confidence: 1,
                    final: true,
                    from: 0,
                    to: 0
                }
            ],
            results: [
                {
                    final: true,
                    alternatives: [
                        {
                            // 1.41 - 43.96
                            transcript:
                                "thank you for choosing rocket fast internet my name's Jennifer how can I help you today I'm so angry right now my internet connection is so damn slow I can't even load my email without waiting for 5 minutes how much was to get any work done I'm paying you people a lot of money and your service sucks I want to cancel my monthly plan right now I'm so sorry to hear this or don't worry I'm here to help you let me see what I can do for you let's start by pulling up your account could you please verify the phone number we have on file for you fine it's 860-995-4167 thank you and I'm speaking with Mister brown is that correct yes ",
                            timestamps: [['got', 44.82, 45.06], ['it', 45.06, 45.22]],
                            confidence: 0.525
                        }
                    ]
                },
                {
                    final: true,
                    alternatives: [
                        {
                            transcript:
                                "that be okay I've gone through the steps believe me I checked everything before calling you owe that's good then can you let me know which lights are lit up on the modem fine high have power Ethernet lights is green on my modem but the third light is flashing red which is the DSL light on the modem ",
                            timestamps: [['got', 44.82, 45.06], ['it', 45.06, 45.22]],
                            confidence: 0.896
                        }
                    ]
                },
                {
                    final: true,
                    alternatives: [
                        {
                            transcript:
                                "are we done yet thank you for your patience as you noticed the DSL light is flashing red on your modem that means you're not getting any DSL signal the good thing is based on our initial test results here we don't have network problems or outages in your area that means we might be able to fix the problem over the phone ",
                            timestamps: [['got', 44.82, 45.06], ['it', 45.06, 45.22]],
                            confidence: 0.97
                        }
                    ]
                },
                {
                    final: true,
                    alternatives: [
                        {
                            transcript:
                                "really as impossible you might have already checked on it but since we have the DSL flight flashing red on your modem it's telling you right away that there could be something wrong with the DSL court it's the great phone cord at the back of the modem could you check if this is loose or properly plugged in ",
                            timestamps: [['got', 44.82, 45.06], ['it', 45.06, 45.22]],
                            confidence: 0.845
                        }
                    ]
                },
                {
                    final: true,
                    alternatives: [
                        {
                            transcript:
                                "okay but this is the last step that'll do just don't hang up high check don't worry I won't hang up on you ",
                            timestamps: [['got', 44.82, 45.06], ['it', 45.06, 45.22]],
                            confidence: 0.888
                        }
                    ]
                },
                {
                    final: true,
                    alternatives: [
                        {
                            transcript:
                                "my goodness the great phone cord was just loose let me plug that in again now the DSL light on the modem is great great that's good to know let's just see now if you can get online could you try one or 2 websites ",
                            timestamps: [['got', 44.82, 45.06], ['it', 45.06, 45.22]],
                            confidence: 0.794
                        }
                    ]
                },
                {
                    final: true,
                    alternatives: [
                        {
                            transcript:
                                "wow you are a miracle worker Jennifer thank you so much he got me on my homepage email with such quick speed I can't believe the internet is working again excellent and here's what else I can offer you since we use bandwidth rocket fast internet for more than 3 years now I'm going to sign you up for a free speed upgrade absolutely free of charge so from your old package instead of 20 megabits per second you should now get up to 40 megabits per second of download speed we want to make sure you get the fastest speed anywhere and are a happy customer ",
                            timestamps: [['got', 44.82, 45.06], ['it', 45.06, 45.22]],
                            confidence: 0.893
                        }
                    ]
                },
                {
                    final: true,
                    alternatives: [
                        {
                            transcript:
                                "wow that's amazing if it's a free upgrade that does make me happy thanks so much well I'm so glad to hear that I'll send you an email confirmation right away if you're free upgrade whoa already got it so is there anything else that I can assist you with no that's it I'm just so thrilled Jennifer all I can say right now is thank you you're very much welcome Mister brown I hope I was able to make you a very satisfied customer yes you did a good bye thanks Mister brown and again my name is Jennifer thank you for choosing rocket fast internet enjoy the rest of your day ",
                            timestamps: [['got', 44.82, 45.06], ['it', 45.06, 45.22]],
                            confidence: 0.913
                        }
                    ]
                }
            ]
        };

        const cards = {
            created_at: mockDateValue,
            entries: [
                {
                    type: 'text',
                    appears: [{ end: 45.22, start: 44.82 }],
                    text:
                        "thank you for choosing rocket fast internet my name's Jennifer how can I help you today I'm so angry right now my internet connection is so damn slow I can't even load my email without waiting for 5 minutes how much was to get any work done I'm paying you people a lot of money and your service sucks I want to cancel my monthly plan right now I'm so sorry to hear this or don't worry I'm here to help you let me see what I can do for you let's start by pulling up your account could you please verify the phone number we have on file for you fine it's 860-995-4167 thank you and I'm speaking with Mister brown is that correct yes "
                },
                {
                    type: 'text',
                    appears: [{ end: 45.22, start: 44.82 }],
                    text:
                        "that be okay I've gone through the steps believe me I checked everything before calling you owe that's good then can you let me know which lights are lit up on the modem fine high have power Ethernet lights is green on my modem but the third light is flashing red which is the DSL light on the modem "
                },
                {
                    type: 'text',
                    appears: [{ end: 45.22, start: 44.82 }],
                    text:
                        "are we done yet thank you for your patience as you noticed the DSL light is flashing red on your modem that means you're not getting any DSL signal the good thing is based on our initial test results here we don't have network problems or outages in your area that means we might be able to fix the problem over the phone "
                },
                {
                    type: 'text',
                    appears: [{ end: 45.22, start: 44.82 }],
                    text:
                        "really as impossible you might have already checked on it but since we have the DSL flight flashing red on your modem it's telling you right away that there could be something wrong with the DSL court it's the great phone cord at the back of the modem could you check if this is loose or properly plugged in "
                },
                {
                    type: 'text',
                    appears: [{ end: 45.22, start: 44.82 }],
                    text:
                        "okay but this is the last step that'll do just don't hang up high check don't worry I won't hang up on you "
                },
                {
                    type: 'text',
                    appears: [{ end: 45.22, start: 44.82 }],
                    text:
                        "my goodness the great phone cord was just loose let me plug that in again now the DSL light on the modem is great great that's good to know let's just see now if you can get online could you try one or 2 websites "
                },
                {
                    type: 'text',
                    appears: [{ end: 45.22, start: 44.82 }],
                    text:
                        "wow you are a miracle worker Jennifer thank you so much he got me on my homepage email with such quick speed I can't believe the internet is working again excellent and here's what else I can offer you since we use bandwidth rocket fast internet for more than 3 years now I'm going to sign you up for a free speed upgrade absolutely free of charge so from your old package instead of 20 megabits per second you should now get up to 40 megabits per second of download speed we want to make sure you get the fastest speed anywhere and are a happy customer "
                },
                {
                    type: 'text',
                    appears: [{ end: 45.22, start: 44.82 }],
                    text:
                        "wow that's amazing if it's a free upgrade that does make me happy thanks so much well I'm so glad to hear that I'll send you an email confirmation right away if you're free upgrade whoa already got it so is there anything else that I can assist you with no that's it I'm just so thrilled Jennifer all I can say right now is thank you you're very much welcome Mister brown I hope I was able to make you a very satisfied customer yes you did a good bye thanks Mister brown and again my name is Jennifer thank you for choosing rocket fast internet enjoy the rest of your day "
                }
            ],
            invocation: { id: boxId, type: SKILLS_METADATA_INVOCATION_TYPE },
            skill: { id: skillId, type: SKILLS_SERVICE_TYPE },
            skill_card_title: {
                code: 'skills_transcript',
                message: 'Transcript'
            },
            skill_card_type: 'transcript',
            status: {},
            type: SKILLS_METADATA_CARD_TYPE
        };
        /* eslint-enable quotes */
        expect.assertions(1);
        const returnedCards = AudioAdaptor.getSkillMetadataCards(skillWriter, response).cards;
        returnedCards.forEach((card) => {
            /* eslint-disable no-param-reassign */
            card.created_at = mockDateValue;
        });
        expect(returnedCards).toEqual([cards]);
    });

    test('getDuration()', () => {
        const results = [
            {
                final: true,
                alternatives: [{ transcript: ' ', timestamps: [['%HESITATION', 1.9, 2.53]], confidence: 0.335 }]
            },
            {
                final: true,
                alternatives: [
                    {
                        transcript: 'we think the labor vain ',
                        timestamps: [
                            ['we', 138.8, 138.96],
                            ['think', 138.96, 139.6],
                            ['the', 139.85, 139.99],
                            ['labor', 139.99, 140.36]
                        ],
                        confidence: 0.915
                    }
                ]
            },
            {
                final: true,
                alternatives: [
                    {
                        transcript:
                            'which are too numerous to mention and we do so in the name of thy son Jesus Christ amen ',
                        timestamps: [
                            ['which', 864.29, 864.53],
                            ['are', 864.53, 864.67],
                            ['too', 864.67, 864.98],
                            ['numerous', 864.98, 865.45],
                            ['to', 865.45, 865.57],
                            ['mention', 865.57, 866.1],
                            ['and', 866.13, 866.3],
                            ['we', 866.3, 866.42],
                            ['do', 866.42, 866.59],
                            ['so', 866.59, 866.85],
                            ['in', 866.85, 866.98],
                            ['the', 866.98, 867.08],
                            ['name', 867.08, 867.28],
                            ['of', 867.28, 867.36],
                            ['thy', 867.36, 867.49],
                            ['son', 867.49, 867.91],
                            ['Jesus', 868.05, 868.41],
                            ['Christ', 868.41, 868.99]
                        ],
                        confidence: 0.818
                    }
                ]
            },
            {
                final: true,
                alternatives: [
                    {
                        transcript: 'would everyone please stand ',
                        timestamps: [['would', 877.35, 877.5], ['everyone', 877.5, 877.91], ['please', 877.91, 878.18]],
                        confidence: 0.843
                    }
                ]
            },
            {
                final: true,
                alternatives: [{ transcript: ' ', timestamps: [['%HESITATION', 896.37, 896.94]], confidence: 0.092 }]
            },
            { final: true, alternatives: [{ transcript: ' ', timestamps: [], confidence: 0.702 }] },
            { final: true, alternatives: [{ transcript: ' ', timestamps: [], confidence: 0.753 }] }
        ];

        expect(AudioAdaptor.getDuration(results)).toEqual(896.94);
    });
});
