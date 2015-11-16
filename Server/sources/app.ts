//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('kinq').enable();
require('async-node');
import { defaultQueue, IDispatchReceiver } from './lib/dispatchQueue';

class App {
  constructor() {
    const defaultOptions = {
      cipherAlgorithm: 'aes-256-cfb',
      password: 'lightsword.neko',
      port: 23333,
      plugin: 'lightsword'
    }
    
  }
}

module.exports = App;