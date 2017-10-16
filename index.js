const _ = require('lodash');
const logError = require('./src/log-error');
const decoder = require('./src/wav-decoder');
const decode = require('./src/wav-stream-decoder');
const { fft, getEnergy } = require('./src/fft');
const getMic = require('./src/mic');
var fs = require('fs');
const colors = require('colors');
var bufferConcat = require('buffer-concat');
const Gpio = require('onoff').Gpio;
const out = new Gpio(17, 'out');

const FILE_NAME = './assets/output.raw';

const micSettings = {
  rate: 44100,
  channels: 2,
  bitwidth: 16,
  debug: false,
  exitOnSilence: 6,
  device: `plughw:${process.argv[2] || '1'}`,
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
const energys = []
let audioData = [];
let buffer = new Buffer([]);

mic.micInputStream.on('data', function(data) {
  buffer = bufferConcat([buffer, data]);
  decode(data).then(audio => {
    audioData = audioData.concat(_.values(audio.channelData[0]));

  }).catch(logError);
});

const outputFileStream = fs.WriteStream(FILE_NAME);
//mic.micInputStream.pipe(outputFileStream);

mic.micInstance.start();

const interval = setInterval(() => {
  console.log(audioData.length)
  const { spectrum }  = fft(audioData);

  const energy = getEnergy(spectrum , 10);

  energys.push(energy);
  if(energy > 0.06) {
      out.writeSync(1);
      console.log('energy ->', colors.green(energy))
      outputFileStream.write(buffer)
  } else {
      console.log('energy ->', colors.red(energy))
  }
  audioData = [];
  buffer = new Buffer([]);
}, 1000);

setTimeout(() => {
  out.writeSync(0);
  clearInterval(interval);
  outputFileStream.end();
  mic.micInstance.stop()
  console.log('max ->',_.max(energys))
}, 20000);
