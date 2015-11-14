import * as net from 'net';
export interface IConnectOptions {
    cipherAlgorithm: string;
    password: string;
    proxySocket: net.Socket;
}
export interface INegotiationOptions extends IConnectOptions {
    dstAddr: string;
    dstPort: number;
}
export interface ITransportOptions extends IConnectOptions {
    clientSocket: net.Socket;
}
export interface IConnectExecutor {
    negotiate: (options: INegotiationOptions, callback: (success: boolean) => void) => void;
    connectDestination: (options: INegotiationOptions, success: boolean) => void;
    transport: (options: ITransportOptions, communicationEnd: () => void) => void;
}
