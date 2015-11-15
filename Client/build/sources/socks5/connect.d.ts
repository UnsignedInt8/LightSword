import * as net from 'net';
import { RequestOptions } from './localServer';
import { IReceiver } from '../lib/dispatchQueue';
export declare class Socks5Connect implements IReceiver {
    cipherAlgorithm: string;
    password: string;
    dstAddr: string;
    dstPort: number;
    serverAddr: string;
    serverPort: number;
    clientSocket: net.Socket;
    timeout: number;
    receive(msg: string, args: RequestOptions): void;
    connectServer(): void;
}
