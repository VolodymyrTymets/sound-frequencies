const _ = require('lodash');
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

/**
 * Get energy of spectrum, by method squares
 * @param {Array} - spectrum of signal after ff
 * @param {Number} - count to left and right from max of spectrum to calculate by method squares
 * 
 **/

const getEnergy = (spectrum, L = 10) => {
  const indexOfMax = getIndexOfMax(spectrum);  

  // build arra to calculate energy +-l from max amplitude
  const toCalculation = [];
  let leftIndex = indexOfMax;
  do {
    toCalculation.push(spectrum[leftIndex]);
    leftIndex--;
  } while (spectrum[leftIndex] && (spectrum[leftIndex].frequency > spectrum[indexOfMax].frequency - L));
  toCalculation.reverse();

  let rightIndex = indexOfMax + 1;
  do {
    toCalculation.push(spectrum[rightIndex]);
    rightIndex++;
  } while (spectrum[rightIndex].frequency < spectrum[indexOfMax].frequency + L);


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

module.exports = getEnergy;