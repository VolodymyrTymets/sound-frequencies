const decoder = require('./src/wav-decoder');
const { fft, getEnergy } = require('./src/fft');

const getRecorded = async () => {
  const name = process.argv[2];
  console.log(name)
  try {
    const audioData = await decoder(`${name}.wav`);
      console.log(audioData.channelData[0].length)
    const { spectrum } = fft(audioData.channelData[0], 256);
    const energy = getEnergy(spectrum , 10);

    console.log(`energy of [${name}] ->`, energy);
  } catch (error) {
    console.log(error)
  }
};

getRecorded();
