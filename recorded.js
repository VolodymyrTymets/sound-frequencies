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

    const toFFT = [];

    for (let index = 0; index < lowRange.length; index = index + N) {
      const slice = lowRange.slice(index, index + N);
      const mean = _.meanBy(slice, Math.abs);

      if(mean > MEAN - MEAN * PERSENT) {
        toFFT.push(mean);
      }
    }

    console.log('mean ->', getMean(lowRange));
    console.log('means ->', toFFT.length);
    console.log('from ->', (lowRange.length / N));

    const { spectrum } = fft(toFFT);
    const energy = getEnergy(spectrum , 10);

    console.log(`energy of [${name}] ->`, energy);
  } catch (error) {
    console.log(error)
  }
};

getRecorded();
