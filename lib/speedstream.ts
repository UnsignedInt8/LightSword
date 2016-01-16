//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------

'use strict'

import * as stream from 'stream';

export class SpeedStream extends stream.Transform {
  private bytesPerSecond = 0;
  private sentBytes = 0;
  private interval = 0;
  
  // speed: KB/s
  constructor(speed: number) {
    super()
    if (speed < 1) throw Error('can be negative speed');
    
    this.bytesPerSecond = speed * 1024;
  }
  
  _transform(data: Buffer, encoding, done: Function) {
    let me = this;
    if (!me.writable) return;
    
    me.push(data, encoding);
    
    setTimeout(() => {
      done();
      me.interval = 0;
      
      if (me.sentBytes > me.bytesPerSecond) {
        me.interval = me.sentBytes / me.bytesPerSecond * 1000;
        me.sentBytes = 0;
      }
    }, me.interval).unref();
    
    me.sentBytes += data.length;
  }

} 