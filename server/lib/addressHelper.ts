//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import * as os from 'os';
import * as util from 'util';

const illegalAddresses = ['127.0.0.1', '::1', '0.0.0.0', '::0', os.hostname()];

export function isIllegalAddress(addr: string): boolean {
  return illegalAddresses.any(a => a === addr);
}

export function ntoa(data: ArrayLike<number>): string {
  let ipVer = data.length;
  switch (ipVer) {
    case 4:
    return util.format('%d.%d.%d.%d', data[0], data[1], data[2], data[3]);
    case 6:
    return util.format('%s%s:%s%s:%s%s:%s%s:%s%s:%s%s:%s%s:%s%s', 
      data[0].toString(16),
      data[1].toString(16), 
      data[2].toString(16), 
      data[3].toString(16), 
      data[4].toString(16), 
      data[5].toString(16), 
      data[6].toString(16),
      data[7].toString(16),
      data[8].toString(16), 
      data[9].toString(16), 
      data[10].toString(16), 
      data[11].toString(16), 
      data[12].toString(16), 
      data[13].toString(16), 
      data[14].toString(16), 
      data[15].toString(16));
  }
}