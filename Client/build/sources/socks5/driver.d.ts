import * as net from 'net';
import { RequestOptions } from './localServer';
import { ISocks5 } from './plugin';
export declare class Socks5Driver {
    cipherAlgorithm: string;
    password: string;
    dstAddr: string;
    dstPort: number;
    serverAddr: string;
    serverPort: number;
    clientSocket: net.Socket;
    timeout: number;
    executor: ISocks5;
    constructor(executor: ISocks5, args: RequestOptions);
    connectServer(): Promise<void>;
}
