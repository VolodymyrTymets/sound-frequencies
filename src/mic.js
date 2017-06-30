const mic = require('mic');
const fs = require('fs');
const path = require('path');
const logError = require('./log-error');

const MIC_SETTINGS = {
  rate: 44100,
  channels: 2,
  debug: true,
  exitOnSilence: 6,
  device: 'plughw:1',
  fileType: 'wav',
};

const getMicInputStream = (fileName, micSettings) => {

  const filePath = path.resolve(__dirname, '../', 'assets', fileName);

  const micInstance = mic(micSettings || MIC_SETTINGS);

  const micInputStream = micInstance.getAudioStream();

  const outputFileStream = fs.WriteStream(filePath);

  micInputStream.pipe(outputFileStream);

  micInputStream.on('error', logError);
  return { micInputStream, micInstance };
};

module.exports = getMicInputStream;