const _ = require('lodash');
const math = require('mathjs');
const fjs = require("frequencyjs");

function nearestPow2( aSize ){
  return Math.pow( 2, Math.round( Math.log( aSize ) / Math.log( 2 ) ) );
}


const getIndexOfMax = spectrum => {
    let max = spectrum[0].amplitude;
    let maxIndex = 0;

    for (var i = 1; i < spectrum.length; i++) {
        if (spectrum[i].amplitude > max) {
            maxIndex = i;
            max = spectrum[i].amplitude;
        }
    }
    return maxIndex;
};

const getEnergy = (spectrum, l) => {
  const indexOfMax = getIndexOfMax(spectrum);
  // console.log('indexOfMax ->', indexOfMax);
  // console.log('spectrum ->', spectrum[indexOfMax].amplitude);

  // build arra to calculate energy +-l from max amplitude
  const toCalculation = [];
  let leftIndex = indexOfMax;
  do {
    toCalculation.push(spectrum[leftIndex]);
    leftIndex--;
  } while (spectrum[leftIndex] && (spectrum[leftIndex].frequency > spectrum[indexOfMax].frequency - l));
  toCalculation.reverse();

  let rightIndex = indexOfMax + 1;
  do {
    toCalculation.push(spectrum[rightIndex]);
    rightIndex++;
  } while (spectrum[rightIndex].frequency < spectrum[indexOfMax].frequency + l);


  // calculate squere
  const squeres = [];
  for(let index = 0; index < toCalculation.length - 1; index ++) {
    const a = toCalculation[index].amplitude;
    const b = toCalculation[index + 1].frequency - toCalculation[index].frequency;
    const s = Math.pow(a * b, 2);
    squeres.push(s);
  }
  console.log('squeres -> ', squeres.length)
  return _.sum(squeres);
};

const fft = (audioData) => {
  const lowRange = audioData;//audioData.channelData[0];
  let waveLength = lowRange.length;
  let index = nearestPow2(waveLength);

  while (!(index <= lowRange.length)) {
    waveLength = waveLength - 2;
    index = nearestPow2(waveLength)
  }

  const wave = lowRange.slice(0, index);
  const spectrum = fjs.Transform.toSpectrum(wave, { method: 'fft'} );
  return { wave: _.values(wave), spectrum };
};

module.exports = { fft, getEnergy };
