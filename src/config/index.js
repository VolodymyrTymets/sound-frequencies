module.exports = {
  SUM_OF_100: 3.910262951200025,
  FLUFF: 0.3, // 30 % 
  ENERGY: 0.03397608593811905,
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