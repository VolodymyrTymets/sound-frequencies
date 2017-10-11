const _ = require('lodash');
const logError = require('./src/log-error');
const decoder = require('./src/wav-decoder');
const decode = require('./src/wav-stream-decoder');
const { fft, getEnergy } = require('./src/fft');
const getMic = require('./src/mic');
var fs = require('fs');

const FILE_NAME = './output.wav';

const micSettings = {
  rate: 44100,
  channels: 2,
  bitwidth: 16,
  debug: false,
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

let audioData = [];

mic.micInputStream.on('data', function(data) {
  //console.log("Recieved Input Stream: " + data.length);
  decode(data).then(audio => {
    //console.log(audio.channelData[0].length);

    //const more = audio.channelData[0].find(value => value > 0);
    //console.log('more than 0 >', more);

    audioData = audioData.concat(_.values(audio.channelData[0]));

  }).catch(logError);
});

mic.micInputStream.on('stopComplete', () => {
  decoder(FILE_NAME)
    .then(audioData => {
      console.log(audioData.channelData[0].length)
      const { spectrum }  = fft(_.values(audioData.channelData[0]));
      const energy = getEnergy(spectrum , 10);
      console.log('energy ->', energy)
    })
    .catch(logError);
});


const outputFileStream = fs.WriteStream(FILE_NAME);
mic.micInputStream.pipe(outputFileStream);

mic.micInstance.start();

setTimeout(() => {
  mic.micInstance.stop()
  console.log(audioData.length)
  const { spectrum }  = fft(audioData);
  audioData = [];
  const energy = getEnergy(spectrum , 10);
  console.log('energy ->', energy)
}, 1000);


