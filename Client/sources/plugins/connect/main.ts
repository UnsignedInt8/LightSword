//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

let executorPath = './lightsword';

module.exports.createExecutor = function() {
  let executor = require(executorPath);
  return new executor();
}