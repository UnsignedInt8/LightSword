import * as net from 'net';
import { ISocks5 } from '../plugins/main';
export declare class Server {
    cipherAlgorithm: string;
    password: string;
    port: number;
    server: net.Server;
    Socks5: ISocks5;
    constructor(options: {
        cipherAlgorithm: string;
        password: string;
        port: number;
        plugin: string;
    });
    start(): void;
    stop(): void;
}
