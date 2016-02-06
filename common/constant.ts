//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

export enum VPN_TYPE {
  APLVPN = 0x01,
  SOCKS5 = 0x05,
  OSXCL5 = 0xa5,
}

export const defaultCipherAlgorithm = 'aes-256-cfb';
export const defaultPassword = 'lightsword.neko';
export const defaultServerPort = 8900;

export abstract class HandshakeOptions  {
  password: string;
  cipherAlgorithm: string;
  timeout: number;
  iv: Buffer;
  speed: number;
  ivLength: number;
  // key: number[];
}

export abstract class OSXCl5Options extends HandshakeOptions  {
  xorNum: number;
}