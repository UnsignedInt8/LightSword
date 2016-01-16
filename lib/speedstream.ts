//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------

'use strict'

import * as stream from 'stream';

export class SpeedStream extends stream.Transform {
  private bytesPerSecond = 0;
  private queue: { data: Buffer, callback: Function }[] = [];
  private intervalTimer: NodeJS.Timer;
  private isDataDelivering = false;
  
  // speed: KB/s
  constructor(speed: number) {
    super()
    if (speed < 1) throw Error('can be negative speed');
    
    this.bytesPerSecond = speed * 1024;
  }
  
  _transform(data: Buffer, encoding, callback: Function) {
    let me = this;
    this.queue.push({ data, callback });
    
    if (!this.intervalTimer) this.intervalTimer = setInterval(this.deliverData, 1000);
  }
  
  private deliverData() {
    if (this.isDataDelivering) return;
    
    this.isDataDelivering = true;
    let sentBytes = 0;
    
    do {
      
      let tuple = this.queue.shift();
      if (!tuple) {
        clearInterval(this.intervalTimer);
        this.intervalTimer.unref();
        this.intervalTimer = undefined;
        return;
      }
      
      this.push(tuple.data);
      tuple.callback();
      
      sentBytes += tuple.data.length;
        
    } while (sentBytes < this.bytesPerSecond);
    
    this.isDataDelivering = false;
  }
} 