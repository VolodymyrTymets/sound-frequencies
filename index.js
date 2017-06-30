const decoder = require('./src/wav-decoder');
const { getFrequencies } = require('./src/math');

decoder('1_cut.wav')
  .then(audioData => {
    const frequencies = getFrequencies(audioData, 44100);
   // console.log(frequencies)
  })
  .catch(err => console.log(err));