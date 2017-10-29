const fs = require('fs');
const path = require('path');
const WavDecoder = require('wav-decoder');
const header = require("waveheader")

const decode = buffer => {
  return WavDecoder.decode(Buffer.concat([header(44100), buffer]));
};

module.exports = decode;
