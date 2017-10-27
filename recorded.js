const _ = require('lodash');
const decoder = require('./src/wav-decoder');
const { fft, getEnergy } = require('./src/fft');

const N = 100;
const MEAN = 0.08548436628297357;
const PERSENT = 0.2;


const getMean = (lowRange) => {
  const means = [];
  for (let index = 0; index < lowRange.length; index = index + N) {
    const slice = lowRange.slice(index, index + N);

    const mean = _.meanBy(slice, Math.abs);
    means.push(mean);
  }
  return _.sum(_.flatten(means)) / (lowRange.length / N);
};

const getRecorded = async () => {
  const name = process.argv[2];
  console.log(name)
  try {
    const audioData = await decoder(`${name}.wav`);
    console.log('all ->', audioData.channelData[0].length);

    const lowRange = audioData.channelData[0];

    const slices = [];

    for (let index = 0; index < lowRange.length; index = index + N) {
      const slice = lowRange.slice(index, index + N);
      const mean = _.meanBy(slice, Math.abs);

      if(mean > MEAN - MEAN * PERSENT) {
        slices.push(_.values(slice));
      }
    }

    console.log('mean ->', getMean(lowRange));
    console.log('means ->', slices.length);
    console.log('from ->', (lowRange.length / N));

    console.log('toFFt ->', _.flatten(slices).length);
    const { spectrum } = fft(_.flatten(slices));
    const energy = getEnergy(spectrum , 10);

    console.log(`energy of [${name}] ->`, energy);
  } catch (error) {
    console.log(error)
  }
};

getRecorded();
