const _ = require('lodash');
const colors = require('colors');
const { wavDecode } = require('./src/wav');
const { fft } = require('./src/fft');
const { getEnergy } = require('./src/energy');
const { Segmenter } = require('./src/segmenter');
const { ENERGY, FLUFF } = require('./src/config');

const segmenter = new Segmenter();

segmenter.on('segment', segment => {
  const { spectrum } = fft(segment);
  const energy = getEnergy(spectrum , 10);

  if (energy > ENERGY - ENERGY * FLUFF && energy < ENERGY + ENERGY * FLUFF) {
    console.log('energy ->', colors.green(energy));
  } else {
    console.log(`energy ->`, colors.red(energy));
  }      
});

segmenter.on('noSegment', () => {
});


const getRecorded = async () => {
  const name = process.argv[2];

  try {
    const audioData = await wavDecode(`${name}.wav`);
    console.log('all ->', audioData.channelData[0].length);

    const wave = audioData.channelData[0];
    segmenter.findSegmant(wave);

    console.log(segmenter.getSum(wave))
    
  } catch (error) {
    console.log(error)
  }
};

getRecorded();
