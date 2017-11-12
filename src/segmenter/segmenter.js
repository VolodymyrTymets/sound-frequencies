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
  findSegmant(wave) {   
    for (let index = 0; index < wave.length; index = index + N) {
      const slice = wave.slice(index, index + N);
      const sum = _.sumBy(slice, Math.abs);

      //console.log('sum ->', sum)
       
      if(sum < SUM_OF_100 - SUM_OF_100 * FLUFF || index + N >= wave.length) {
        if(this._waves.length > COUNT_OF_BLOCKS) {
          // console.log('waves ->', this._waves.length)
          this.emit('segment', _.flatten(this._waves));  
        }
        this._waves = [];
        this.emit('noSegment');
      } else { 
        this._waves.push(_.values(slice));  
      }
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