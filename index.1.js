const _ = require('lodash');
const colors = require('colors');
const Gpio = require('onoff').Gpio;
//const out = new Gpio(17, 'out');

const { Segmenter } = require('./src/segmenter');
const { wavStreamDecode } = require('./src/wav');
const { fft } = require('./src/fft');
const { getEnergy } = require('./src/energy');
const getMic = require('./src/mic');
const logError = require('./src/log-error');
const { micSettings, ENERGY, FLUFF } = require('./src/config');
let wav = require('node-wav');
var header = require("waveheader")


console.log(header(44100 * 16))

const decodeFormat = {
  formatId: 28980,
  floatingPoint: false,
  numberOfChannels: micSettings.channels,
  sampleRate: micSettings.rate,
  byteRate: micSettings.rate,
  blockSize: micSettings.bitwidth,
  bitDepth: micSettings.bitwidth
};

const segmenter = new Segmenter();

segmenter.on('segment', segment => {
  const { spectrum } = fft(segment);
  const energy = getEnergy(spectrum , 10);
  console.log(`energy ->`, energy)
  if (energy > ENERGY - ENERGY * FLUFF && energy < ENERGY + ENERGY * FLUFF) {
    console.log('energy ->', colors.green(energy))
    //out.writeSync(1);
  } else {
    //out.writeSync(0);
  }      
});
let count = 0;

segmenter.on('noSegment', () => {
  //out.writeSync(0);
  //console.log('no')
});

const mic = getMic(micSettings);
mic.micInputStream.on('data', function(data) {
  //console.log(header)
  let result = wav.decode(Buffer.concat([header(44100 * 1), data]));
  console.log('result ->', result && result.channelData[0])
  wavStreamDecode(data)
  .then(audioData => {
 
    const wave = audioData.channelData[0];
    console.log(wave.length)
    segmenter.findSegmant(wave);
    
    // test log
    const sum = segmenter.getSum(wave);
    //console.log('sum ->', sum)
  })
  .catch(logError);
});


mic.micInstance.start();
