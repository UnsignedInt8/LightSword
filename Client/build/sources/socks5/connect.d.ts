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
    static isLocal: boolean;
    static pluginPath: string;
    static count: number;
    static isLocalProxy(addr: string): void;
    constructor(args: RequestOptions);
    connectServer(): void;
}
