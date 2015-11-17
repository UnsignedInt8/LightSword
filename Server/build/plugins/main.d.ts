import * as net from 'net';
export interface ISocks5Options {
    cipherAlgorithm: string;
    password: string;
    clientSocket: net.Socket;
}
export declare enum Socks5CommandType {
    connect = 1,
    bind = 2,
    udpAssociate = 3,
}
export interface ISocks5 {
    negotiate: (options: ISocks5Options, callback: (success: boolean, reason?: string) => void) => void;
    transport: (options: ISocks5Options) => void;
}
