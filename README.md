# Box Skills Samples: Custom Skills for Processing Audio Files

This repository contains community created Box Skills samples for processing **audio files** on Box. By clicking on each sub-folder, you can see a demo image of the end product, as it would look in your Box File Preview.

* [VoiceBase Dual-Channel Audio Analysis](voicebase-callcenter-audio-analysis) - Uses the [VoiceBase](https://developer.voicebase.com/) API  to automatically extract data insights like transcript, topics, call metrics and sensitive information from audio files and attach them to the respective files as Skills Metadata Cards in Box Preview. This Skill is especially geared towards call center audio file analysis.

**Note:** Box supports [the following audio formats](https://community.box.com/t5/How-to-Guides-for-Managing/File-Types-and-Fonts-Supported-in-Box-Content-Preview/ta-p/327#Type_AudioFiles) to directly load and play in Box Preview. However some of the sample Skills may support a subset or non-overlapping set of audio formats given limitations on the machine learning service. You can always expand the file formats supported by your Skills by using the [BasicFormat](https://github.com/box/box-skills-kit-nodejs/tree/master/skills-kit-library#basic-format) functionality in Skills-kit library, which converts files on Box to .mp3 format for all audio files.


## What are Box Skills?

Box Skills are web applications configured with Box Platform that performs custom processing for files uploaded to Box. Typically they link to a machine learning service that does the processing for the files. Your choice of machine learning service, in-house or external, would depend on your business case or that of your customers on Box. However, the audio, video, image and document sample Skills repositories in Box Community can provide some guidance or inspiration on what you can built upon or deployed as-is.

Visit the [Official Box Skills Developer Documentation](https://developer.box.com/docs/box-skills) for complete information on Box Skills, the kind of Skill Metadata Cards that you can create to show on Box Preview, as well as instructions on configuring your Skill with Box.

## What is the Box Skills Kit?

The [Github Repository for Box Skills Kit Library](https://github.com/box/box-skills-kit-nodejs) is our official toolkit for writing custom Box Skills in Node.js. It minimizes the client side code to Box Files and Skills-Invocations APIs to a few lines and provides other utility functions to make developing your code very simple. It has the [Skills-kit Library and API Documentation](https://github.com/box/box-skills-kit-nodejs/tree/master/skills-kit-library)  and Boilerplate Skills that you can quickly deploy and expand on, when developing a new Skill.

## How do I deploy a Box Skill?

In developing your custom Box Skill, you would need to deploy it somewhere. Have a look at our [Quick Start Deployment Instructions](https://github.com/box/box-skills-kit-nodejs/tree/master/boilerplate-skills) to learn how to deploy the boilerplate Skills to any of your preferred cloud server providers or on your own server environment. Additionally, each of the sample Skills in this repository may give extra or alternative deployment instructions, that you can use.


## License

This project is licensed under the [Apache 2.0 License](LICENSE)

