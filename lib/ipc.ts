//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

export enum COMMAND {
  START = 0x1,
  STOP = 0x2,
  RESTART = 0x3,
  PAUSE = 0x4,
  RESUME = 0x5,
}

export const UnixSocketPath = '/tmp/nodejs-lightsword-nekoouji.sock';