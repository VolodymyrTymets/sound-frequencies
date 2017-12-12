const _ = require('lodash');
const { EventEmitter } = require('events');
const { SUM_OF_100, FLUFF } = require('../config');

const N = 100;
const COUNT_OF_BLOCKS = 100;

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
    super()
    this._waves = [];
    this._buffers = new ArrayBuffer([]);
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
  findSegmant(wave, buffer) {
    const sums = [];
    for (let index = 0; index < wave.length; index = index + N) {
      const slice = wave.slice(index, index + N);
      const sum = _.sumBy(slice, Math.abs);
      sums.push(sum)
    }

    const avarage = _.mean(sums);

   if(avarage < 1) {
     if(this._waves.length > 0) {
       this.emit('segment', _.flatten(this._waves),  this._buffers);
     }
     this._waves = [];
     this._buffers = [];
     this.emit('noSegment');

   } else {
     this._waves.push(_.values(wave));
     this._buffers = this._buffers.length ? Buffer.concat([this._buffers , buffer]) : buffer;
   }
  }
  
  findSegmantTest(wave) {
    const sum = this.getSum(wave)
    console.log('sum ->', sum) 
    if(sum > SUM_OF_100 - SUM_OF_100 * FLUFF) {
      this._waves.push(_.values(wave));
    } else {
      if(this._waves.length > COUNT_OF_BLOCKS) { 
        console.log('length ->', this._waves.length)      
        this.emit('segment', _.flatten(this._waves));  
      }
      this._waves = [];
      this.emit('noSegment');  
    }   
  }  
}

module.exports = Segmentor;