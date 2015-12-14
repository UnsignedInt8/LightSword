//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'
import { Decipher } from 'crypto';

export enum VPN_TYPE {
  SOCKS5 = 0x05
}

export const defaultCipherAlgorithm = 'aes-256-cfb';
export const defaultPassword = 'lightsword.neko';
export const defaultServerPort = 8900;

export type ISocks5Options = {
  decipher: Decipher,
  password: string,
  cipherAlgorithm: string,
  timeout: number
}