# Microsoft Vision Image Extraction

This is a Box Audio skill that uses the [IBM Speech to Text API](https://www.ibm.com/watson/services/speech-to-text/) to extract transcripts from from audio files and write it back to Box as metadata on the file.

![screenshot](ibm-audio-screenshot.png)

This Skill:

* Supporting file types: flac, mp3, wav, aac, aif, aifc, aiff, amr, au, flac, m4a, mp3, ra, wav, wma
* Supporting file sizes: <200 MB
* Supporting languages: The code works for US-English. But you can easily change the param for speech to text api call to any of the available [language models](https://cloud.ibm.com/apidocs/speech-to-text).

## Usage

### Prerequisites

* Make sure to sign up for a [Box Developer](https://developer.box.com/) account and prepare your app for Box skills. See our [developer documentation](https://developer.box.com/docs/box-skills) for more guidance.

### Configuring Serverless

Our Box skills uses the excellent [Serverless framework](https://serverless.com/). This framework allows for deployment to various serverless platforms, but in this example we will use AWS as an example.

To use Serverless, install the NPM module.

```bash
npm install -g serverless
```

Next, follow our guide on [configuring Serverless for AWS](../AWS_CONFIGURATION.md), or any of the guides on [serverless.com](https://serverless.com/) to allow deploying to your favorite serverless provider.

### Deploying

Clone this repo and change into the sample folder.

```bash
git clone https://github.com/box-community/sample-audip-skills
cd sample-audio-skills/ibm-watson-transcript-extraction
```

Then simply deploy the Skill using Serverless.

```bash
serverless deploy -v
```

At the end of this, you will have an invocation URL for your Lambda function.

### Set the invocation URL

The final step is to [configure your Box Skill with the invocation URL](https://developer.box.com/docs/configure-a-box-skill) for your Lambda function. You should have received this in the previous, after you deployed the function for the first time.

Once your new skill is called by our code, the Skill usually takes around a few minutes to hours to process and write the new metadata to the file, depending on the runtime of the audio.
