//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const DispatchQueue = require('../build/lib/dispatchQueue.js').DispatchQueue;
const assert = require('assert');
const kinq = require('kinq');
kinq.enable();

describe('dispatch queue', () => {
  
  let queue = new DispatchQueue();
  let receiver = {
    receive(msg, obj) {
      console.log('received: ' + msg + '-' + obj);
    }
  };
  
  it('register item', () => {
    assert(queue.register('xxx', receiver));
  });
  
  it('unregister item', () => {
    assert(queue.unregister('xxx', receiver));
  });
  
  it('publish', (done) => {
    let receiver = {
      receive(msg, obj) {
        assert(msg === 'x2x');
        assert(obj === 'Hello');
        done();
      }
    };
    
    queue.register('x2x', receiver);
    queue.publish('x2x', 'Hello');
  });
})