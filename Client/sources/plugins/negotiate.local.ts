//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import { INegotiationOptions } from './main';

function negotiate(options: INegotiationOptions, finishCallback: (result: boolean, reason?: string) => void) {
  process.nextTick(() => finishCallback(true));
}

module.exports = negotiate;