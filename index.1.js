const _ = require('lodash');
const colors = require('colors');
const Gpio = require('onoff').Gpio;
//const out = new Gpio(17, 'out');

const { Segmenter } = require('./src/segmenter');
const { wavStreamDecode1 } = require('./src/wav');
const { fft } = require('./src/fft');
const { getEnergy } = require('./src/energy');
const getMic = require('./src/mic');
const logError = require('./src/log-error');
const { micSettings, ENERGY, FLUFF } = require('./src/config');
let wav = require('node-wav');

const segmenter = new Segmenter();

segmenter.on('segment', segment => {
  const { spectrum } = fft(segment);
  const energy = getEnergy(spectrum , 10);  
  if (energy > ENERGY - ENERGY * FLUFF && energy < ENERGY + ENERGY * FLUFF) {
    console.log('energy ->', colors.green(energy))
    //out.writeSync(1);
  } else {
    //out.writeSync(0);
    console.log('energy ->', colors.red(energy))
  }      
});
let count = 0;

segmenter.on('noSegment', () => {
  //out.writeSync(0);
  //console.log('no')
});

const mic = getMic(micSettings, 'record.wav');
mic.micInputStream.on('data', function(buffer) {
  wavStreamDecode1(buffer)
  .then(audioData => { 
    const wave = audioData.channelData[0];
    //console.log('wave length _> ', wave.length)
    segmenter.findSegmant(wave);
    
    // test log
    const sum = segmenter.getSum(wave);
    //console.log('sum ->', sum)
  })
  .catch(logError);
});


mic.micInstance.start();
