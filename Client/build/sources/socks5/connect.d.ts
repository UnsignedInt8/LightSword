import * as net from 'net';
import { REQUEST_CMD } from './consts';
import { RequestOptions } from './localServer';
import { ISocks5Plugin } from '../plugins/main';
export declare class Socks5Connect {
    cipherAlgorithm: string;
    password: string;
    dstAddr: string;
    dstPort: number;
    serverAddr: string;
    serverPort: number;
    clientSocket: net.Socket;
    timeout: number;
    socks5Plugin: ISocks5Plugin;
    cmdType: REQUEST_CMD;
    constructor(plugin: ISocks5Plugin, cmdType: REQUEST_CMD, args: RequestOptions);
    connectServer(): void;
}
