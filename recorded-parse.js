const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const header = require("waveheader");
const { fft } = require('./src/fft');
const { getEnergy } = require('./src/energy');
const { Segmenter } = require('./src/segmenter');
const { notify } = require('./src/notifier');
const WavDecoder = require('wav-decoder');
const { NERVE_LOW_ENERGY, NERVE_UP_ENERGY, MUSCLE_LOW_ENERGY, MUSCLE_UP_ENERGY, FLUFF, micSettings } = require('./src/config');

const segmenter = new Segmenter();
const notifyMode = ['console', 'sound', 'gpio'];

const readFile = filepath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer);
    });
  });
};

segmenter.on('segment', segment=> {
  console.log('segment.length ->', segment.length);
  const { spectrum } = fft(segment);
  const energy = getEnergy(spectrum , 10);

  if (energy > NERVE_LOW_ENERGY && energy < NERVE_UP_ENERGY) {   
    notify('nerve', energy, notifyMode);
  } else if(energy > MUSCLE_LOW_ENERGY && energy < MUSCLE_UP_ENERGY) {
    notify('muscle', energy, notifyMode);
  } else {
    notify('', energy, notifyMode);
  }    
});

segmenter.on('noSegment', () => {
});


const getRecorded = async () => {
  const name = process.argv[2];
  const filePath = path.resolve(__dirname, './', 'assets', `${name}.wav`);

  try {
    const buffer = await readFile(filePath);
    const step = 16384;

    for (let index = step; index < buffer.length; index = index + step) {
      const slice = buffer.slice(index, step + index);
      const withHeader = Buffer.concat([header(micSettings.rate * 1024, micSettings), slice]);
      const audioData = await WavDecoder.decode(withHeader);
      const wave = audioData.channelData[0];
      segmenter.findSegment(wave, withHeader);
    }
    
  } catch (error) {
    console.log(error)
  }
};

getRecorded();
