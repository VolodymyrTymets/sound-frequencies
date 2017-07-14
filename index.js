const logError = require('./src/log-error');
const decoder = require('./src/wav-decoder');
const decode = require('./src/wav-stream-decoder');
const { getFrequencies } = require('./src/math');
const getMic = require('./src/mic');

const FILE_NAME = 'output.wav';

const micSettings = {
  rate: 44100,
  channels: 2,
  bitwidth: 16,
  debug: true,
  exitOnSilence: 6,
  device: 'plughw:1',
  fileType: 'wav',
};

const decodeFormat  =  {
  formatId: 28980,
  floatingPoint: false,
  numberOfChannels: micSettings.channels,
  sampleRate: micSettings.rate,
  byteRate: micSettings.rate,
  blockSize: micSettings.bitwidth,
  bitDepth: micSettings.bitwidth
};

const mic = getMic(FILE_NAME, micSettings);


mic.micInputStream.on('data', function(data) {
  console.log("Recieved Input Stream: " + data.length);
  decode(data).then(audio => {
    console.log(audio.channelData[0].length);
    const more = audio.channelData[0].find(value => value > 0);
    console.log('more than 0 >', more);
  }).catch(logError);
});

mic.micInputStream.on('stopComplete', () => {
  // decoder(FILE_NAME)
  //   .then(audioData => {
  //     const frequencies = getFrequencies(audioData, 44100);
  //     console.log(frequencies.slice(0, 10))
  //   })
  //   .catch(logError);
});

mic.micInstance.start();
setTimeout(() => mic.micInstance.stop(), 2000);
