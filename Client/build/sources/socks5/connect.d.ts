import * as net from 'net';
import { RequestOptions } from './localServer';
export declare class Socks5Connect {
    cipherAlgorithm: string;
    password: string;
    dstAddr: string;
    dstPort: number;
    serverAddr: string;
    serverPort: number;
    clientSocket: net.Socket;
    timeout: number;
    isLocal: boolean;
    static isLocalProxy(addr: string): boolean;
    constructor(args: RequestOptions);
    connectServer(): void;
}
