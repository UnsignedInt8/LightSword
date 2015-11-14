import * as net from 'net';
export declare type RequestOptions = {
    clientSocket: net.Socket;
    dstAddr: string;
    dstPort: number;
    serverAddr: string;
    serverPort: number;
    cipherAlgorithm: string;
    password: string;
    timeout?: number;
};
export declare class LocalServer {
    addr: string;
    port: number;
    password: string;
    cipherAlgorithm: string;
    serverAddr: string;
    serverPort: number;
    timeout: number;
    socks5Username: string;
    socks5Password: string;
    private _server;
    private static SupportedVersions;
    start(): boolean;
    stop(): boolean;
    private handleHandshake(data);
    private handleAuthentication(data);
    private refineRequest(data);
}
