const logError = require('./src/log-error');
const decoder = require('./src/wav-decoder');
const { getFrequencies } = require('./src/math');
const getMic = require('./src/mic');


const FILE_NAME = 'output.wav';

const mic = getMic(FILE_NAME, {
  rate: 44100,
  channels: 2,
  debug: true,
  exitOnSilence: 6,
  device: 'plughw:1',
  fileType: 'wav',
});

mic.micInputStream.on('stopComplete', () => {
  decoder(FILE_NAME)
    .then(audioData => {
      const frequencies = getFrequencies(audioData, 44100);
      console.log(frequencies.slice(0, 10))
    })
    .catch(logError);
});

mic.micInstance.start();
setTimeout(() => mic.micInstance.stop(), 2000);