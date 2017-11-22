const colors = require('colors');
const fs = require('fs');
const wav = require('wav');
const Speaker = require('speaker');
var Sound = require('node-aplay');

const path = require('path');

const notifyLog = (type, energy) => {
  switch(type) {
    case 'muscle': 
      return console.log('energy ->', colors.blue(energy));
    case 'nerve': 
      return console.log('energy ->', colors.green(energy));
    default: 
     return console.log('energy ->', colors.red(energy));  
  }
}

const notifySound = (type, energy) => { 
  const playType = type => {
    const reader = new wav.Reader();
    const file = fs.createReadStream(path.resolve(__dirname, '../../', `assets/out/${type}.wav`)); 
    reader.on('format', format =>
      reader.pipe(new Speaker(format)));
    file.pipe(reader);
  }; 
  
  const playType1 = type => {
    new Sound(path.resolve(__dirname, '../../', `assets/out/${type}.wav`)).play();
  }; 
  
  switch(type) {
    case 'muscle':  
      return playType1('muscle')
    case 'nerve': 
      return playType1('nerve')
    default: 
     return ; 
  }
}


const notifyGPIO = (type, energy) => {
  try {
    const Gpio = require('onoff').Gpio;
    const out = new Gpio(21, 'out');  
  
    switch(type) {
      case 'muscle':  
        return playType('muscle')
      case 'nerve': 
        return out.writeSync(1);
      default: 
        return out.writeSync(0);
    }
  } catch (error) {
    console.log(colors.blue('---> No gpi detected...'));
  }
}


const notify = (type, energy, mode) => {
  if (mode.includes('console')) {
    notifyLog(type, energy);
  }
  if (mode.includes('sound')) {   
    notifySound(type, energy);
  }
  if (mode.includes('gpio')) {   
    notifyGPIO(type, energy);
  }
};

module.exports = { notify };