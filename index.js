const _ = require('lodash');
const colors = require('colors');
// const Gpio = require('onoff').Gpio;
//const out = new Gpio(17, 'out');

const { wavStreamDecode1 } = require('./src/wav');
const { fft } = require('./src/fft');
const { getEnergy } = require('./src/energy');
const getMic = require('./src/mic');
const logError = require('./src/log-error');
const { micSettings, ENERGY, FLUFF } = require('./src/config');
let wav = require('node-wav');

let buffers = [];

let MAX = 0;

const mic = getMic(micSettings);
mic.micInputStream.on('data', function(buffer) {
  buffers.push(buffer);

  if(buffers.length > 10) {
    wavStreamDecode1(Buffer.concat(buffers))
      .then(audioData => {
        const wave = audioData.channelData[0];
        const { spectrum } = fft(wave);
        const energy = getEnergy(spectrum , 10);

        MAX = energy > MAX ? energy : MAX;
        // console.log('energy ->', colors.red(energy))
        if (energy > MAX - MAX * FLUFF && energy < MAX + MAX * FLUFF) {
          console.log('energy ->', colors.green(energy))
        } else {
          console.log('energy ->', colors.red(energy))
        }
      })
      .catch(logError);
    buffers = [];
  };
});


mic.micInstance.start();
console.log('-------> start')