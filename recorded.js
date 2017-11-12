const _ = require('lodash');
const colors = require('colors');
const { wavDecode } = require('./src/wav');
const { fft } = require('./src/fft');
const { getEnergy } = require('./src/energy');
const { Segmenter } = require('./src/segmenter');
const { notify } = require('./src/notifier');
const { NERVE_LOW_ENERGY, NERVE_UP_ENERGY, MUSCLE_LOW_ENERGY, MUSCLE_UP_ENERGY, FLUFF } = require('./src/config');

const segmenter = new Segmenter();
const notifyMode = ['console', 'sound', 'gpio'];

segmenter.on('segment', segment => {  
  console.log('segment.length ->', segment.length)
  if(segment.length < 20000) return
  
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

  try {
    const audioData = await wavDecode(`${name}.wav`);
    console.log('all ->', audioData.channelData[0].length);

    const wave = audioData.channelData[0];
    segmenter.findSegmant(wave);

    console.log('sum ->', segmenter.getSum(wave))
    
  } catch (error) {
    console.log(error)
  }
};

getRecorded();
