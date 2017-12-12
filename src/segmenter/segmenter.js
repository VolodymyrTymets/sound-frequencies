const _ = require('lodash');
const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');
const { LIMIT_OF_SILENCE } = require('../config');

const N = 100;


/**
 * Provide filter wave
 * 
 * @example 
 *          const segmenter = new Segmenter();
            segmenter.on('segment', segment => {            
            });
            segmenter.findSegmant(wave)      
 **/
class Segmentor extends EventEmitter {
  constructor() {
    super();
    this._waves = [];
    this._buffers = new ArrayBuffer([]);
  }

  _saveSegment(buffer, segment) {
    const filePath = path.resolve(__dirname, '../../', 'assets', './segments',  `${segment.length}.wav`);
    fs.writeFile(filePath, buffer, err => {
      if(err) {
        return console.log(err)
      }
      console.log(`${segment.length}.wav is saved`);
    });
  }

  getSum (wave)  {
    const means = [];
    for (let index = 0; index < wave.length; index = index + N) {
        const slice = wave.slice(index, index + N);
    
        const mean = _.sumBy(slice, Math.abs);
        means.push(mean);
    }
    return _.min(_.flatten(means));
  };  

 /**
 *  filter noiz from wave, by equall sum of 100 ponts with standart (SUM_OF_100)
 *  @param {Array} 
 **/
 findSegment(wave, buffer) {
   const sums = [];
   for (let index = 0; index < wave.length; index = index + N) {
     const slice = wave.slice(index, index + N);
     const sum = _.sumBy(slice, Math.abs);
     sums.push(sum)
   }

   const average = _.mean(sums);

   if (average < LIMIT_OF_SILENCE) {
     const segment = _.flatten(this._waves);
     // todo  test value
     if (segment.length > 50000) {
       this._saveSegment(this._buffers, segment);
       this.emit('segment', segment);
     }
     this._waves = [];
     this._buffers = [];
     this.emit('noSegment');

   } else {
     this._waves.push(_.values(wave));
     this._buffers = this._buffers.length ? Buffer.concat([this._buffers, buffer]) : buffer;
   }
 }

}

module.exports = Segmentor;