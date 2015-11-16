import * as net from 'net';
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
    constructor(plugin: ISocks5Plugin, args: RequestOptions);
    connectServer(): void;
}
