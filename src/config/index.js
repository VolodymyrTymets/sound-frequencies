module.exports = {
  SUM_OF_100: 0.41178091522306204,
  FLUFF: 0.3, // 30 % 
  ENERGY: 0.03397608593811905,
  NERVE_LOW_ENERGY: 0.02,
  NERVE_UP_ENERGY: 0.05,
  MUSCLE_LOW_ENERGY: 0.004,
  MUSCLE_UP_ENERGY:  0.007,
  micSettings: {
    rate: 44100,
    channels: 2,
    bitwidth: 16,
    encoding: 'unsinged-integer',
    debug: false,
    exitOnSilence: 6,
    device: `plughw:${process.argv[2] || '1'}`,
    fileType: 'wav',
  }, 
};