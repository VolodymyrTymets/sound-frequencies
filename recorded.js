const _ = require('lodash');
const colors = require('colors');
const { wavDecode } = require('./src/wav');
const { fft } = require('./src/fft');
const { getEnergy } = require('./src/energy');

const N = 100;
const SUM = 3.910262951200025;
const PERSENT = 0.3;
const ENERGY = 0.03397608593811905;
const COUNT_OF_BLOCK = 100;


const getSum = (lowRange) => {
  const means = [];
  for (let index = 0; index < lowRange.length; index = index + N) {
    const slice = lowRange.slice(index, index + N);

    const mean = _.sumBy(slice, Math.abs);
    means.push(mean);
  }
  return _.mean(_.flatten(means));
};

const getRecorded = async () => {
  const name = process.argv[2];

  try {
    const audioData = await wavDecode(`${name}.wav`);
    console.log('all ->', audioData.channelData[0].length);

    const lowRange = audioData.channelData[0];

    let slices = [];

    for (let index = 0; index < lowRange.length; index = index + N) {
      const slice = lowRange.slice(index, index + N);
      const mean = _.sumBy(slice, Math.abs);

      if(mean > SUM - SUM * PERSENT) {
        slices.push(_.values(slice));
      } else {
        //console.log('slices.length  _>', slices.length )
        if(slices.length > COUNT_OF_BLOCK) {
          const { spectrum } = fft(_.flatten(slices));
          const energy = getEnergy(spectrum , 10);
          if (energy > ENERGY - ENERGY * PERSENT && energy < ENERGY + ENERGY * PERSENT) {
            console.log(`energy of [${name}] ->`, colors.green(energy));
          } else {
            console.log(`energy of [${name}] ->`, colors.red(energy));
          }
        }
        slices  = []
      }
    }
    console.log(getSum(lowRange))
  } catch (error) {
    console.log(error)
  }
};

getRecorded();
