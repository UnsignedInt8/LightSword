//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';

/** 
 * 协商密匙
 */
export type NegotiationOptions = {
  serverAddr: string;
  serverPort: number;
  cipherAlgorithm: string;
  password: string;
  proxySocket: net.Socket;
}

export type Negotiate = (options: NegotiationOptions, callback: (success: boolean) => void) => void;

/**
 * Connect 命令请求使用
 * 
 * 要求第一次远程服务器Connect成功之后反馈本地客户端是否连接成功
 */
export type Connect = (success: boolean) => void;

/**
 * 传输处理
 */
export type TransportOptions = {
  serverAddr: string;
  serverPort: number;
  dstAddr: string;
  dstPort: number;
  proxySocket: net.Socket;
  clientSocket: net.Socket;
}

export type Transport = (options: TransportOptions, communicationEnd: () => void) => void;

export interface IExecutor {
  negotiate: Negotiate,
  transport: Transport,
  firstConnect?: Connect
}