//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as os from 'os';

const illegalAddresses = ['127.0.0.1', '::1', '0.0.0.0', '::0', os.hostname()];

export function isIllegalAddress(addr: string): boolean {
  return illegalAddresses.any(a => a === addr);
}