import * as net from 'net';
export declare class Server {
    cipherAlgorithm: string;
    password: string;
    port: number;
    server: net.Server;
    Socks5: any;
    constructor(options: {
        cipherAlgorithm: string;
        password: string;
        port: number;
        plugin: string;
    });
    start(): void;
    stop(): void;
}
