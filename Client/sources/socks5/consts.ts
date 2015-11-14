//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

export enum AUTHENTICATION {
  NOAUTH = 0x00,
  GSSAPI = 0x01,
  USERPASS = 0x02,
  NONE = 0xFF
}

export enum REQUEST_CMD {
  CONNECT = 0x01,
  BIND = 0x02,
  UDP_ASSOCIATE = 0x03
}

export enum ATYP {
  IPV4 = 0x01,
  DN = 0x03,
  IPV6 = 0x04
}

export enum REPLY_CODE {
  SUCCESS= 0x00,
  SOCKS_SERVER_FAILURE= 0x01,
  CONNECTION_NOT_ALLOWED= 0x02,
  NETWORK_UNREACHABLE= 0x03,
  HOST_UNREACHABLE= 0x04,
  CONNECTION_REFUSED= 0x05,
  TTL_EXPIRED= 0x06,
  CMD_NOT_SUPPORTED= 0x07,
  ADDR_TYPE_NOT_SUPPORTED= 0x08,
}

export enum SOCKS_VER {
  V5 = 0x05,
  V4 = 0x04
}