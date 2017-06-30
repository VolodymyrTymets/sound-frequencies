const fft = require('fft-js').fft;
const fftUtil = require('fft-js').util;


const getPhasors = audioData => {
  const lowRange = audioData.channelData[0];
  const upRange = audioData.channelData[1];
  const phasors = [];

  console.log('sampleRate ->', audioData.sampleRate);

  lowRange.forEach((lowRangeItem, index) =>
    phasors.push([lowRangeItem, upRange[index]]));
  return phasors;
}

const getFrequencies = (audioData, rate) =>
  fftUtil.fftFreq(getPhasors(audioData), rate || audioData.sampleRate);


module.exports = { getFrequencies };
