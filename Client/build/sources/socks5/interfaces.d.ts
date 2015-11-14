import * as net from 'net';
export declare type NegotiationOptions = {
    serverAddr: string;
    serverPort: number;
    cipherAlgorithm: string;
    password: string;
    proxySocket: net.Socket;
};
export declare type INegotiate = (options: NegotiationOptions, callback: (success: boolean) => void) => void;
export declare type TransportOptions = {
    serverAddr: string;
    serverPort: number;
    dstAddr: string;
    dstPort: number;
    proxySocket: net.Socket;
    clientSocket: net.Socket;
};
export declare type ITransport = (options: TransportOptions, communicationEnd: () => void) => void;
