const mic = require('mic');
const fs = require('fs');
const path = require('path');
const logError = require('./log-error');

const getMicInputStream = (micSettings, fileName) => {  

  const micInstance = mic(micSettings || MIC_SETTINGS);

  const micInputStream = micInstance.getAudioStream();
 
  if(fileName) {
    const filePath = path.resolve(__dirname, '../', 'assets', fileName);
    const outputFileStream = fs.WriteStream(filePath);

    micInputStream.pipe(outputFileStream);
  }

  micInputStream.on('error', logError);
  return { micInputStream, micInstance };
};

module.exports = getMicInputStream;
