const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const { wavDecode } = require('./src/wav');
const header = require("waveheader");
const { fft } = require('./src/fft');
const { getEnergy } = require('./src/energy');
const { Segmenter } = require('./src/segmenter');
const { notify } = require('./src/notifier');
const WavDecoder = require('wav-decoder');
const { NERVE_LOW_ENERGY, NERVE_UP_ENERGY, MUSCLE_LOW_ENERGY, MUSCLE_UP_ENERGY, FLUFF, micSettings } = require('./src/config');

const segmenter = new Segmenter();
const notifyMode = ['console', 'sound', 'gpio'];

segmenter.on('segment', (segment, buffer)=> {
  console.log('segment.length ->', segment.length);

  //if(segment.length < 20000) return
  // seve segment
  const filePath = path.resolve(__dirname, './', 'assets', './segments',  `${buffer.length}.wav`);
  sveFile(filePath, buffer)
    .then(() => console.log(`${segment.length} saved.`))
    .catch(console.log);
  
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

const sveFile = (filePath, buffer) => new Promise((resolve, reject) => {
  fs.writeFile(filePath, buffer, err => {
    if(err) {
      reject(err);
    }
    resolve();
  });
});


const getRecorded = async () => {
  const name = process.argv[2];
  const filePath = path.resolve(__dirname, './', 'assets', `${name}.wav`);

  try {

    const buffer = await readFile(filePath);
    const step = 16384;

    for (let index = step; index < buffer.length; index = index + step) {
      const slice = buffer.slice(index, step + index);
      const withHeader = Buffer.concat([header(micSettings.rate  * 1024, micSettings), slice]);
      const audioData = await WavDecoder.decode(withHeader);
      const wave = audioData.channelData[0];
      segmenter.findSegmant(wave, withHeader);
      //console.log('sum ->', segmenter.getSum(wave))
    }
    
  } catch (error) {
    console.log(error)
  }
};

getRecorded();
