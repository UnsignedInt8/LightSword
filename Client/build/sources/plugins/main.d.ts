import * as net from 'net';
export interface IBasicOptions {
    cipherAlgorithm: string;
    password: string;
}
export interface IStreamBasicOptions extends IBasicOptions {
    proxySocket: net.Socket;
}
export interface INegotiationOptions extends IStreamBasicOptions {
    dstAddr: string;
    dstPort: number;
}
export interface IStreamTransportOptions extends IStreamBasicOptions {
    clientSocket: net.Socket;
}
export interface IPluginPivot {
    negotiate: (options: INegotiationOptions, finishCallback: (result: boolean, reason?: string) => void) => void;
    transportStream: (options: IStreamTransportOptions) => void;
}
export declare class PluginPivot implements IPluginPivot {
    negotiate: (options: INegotiationOptions, finishCallback: (result: boolean, reason?: string) => void) => void;
    transportStream: (options: IStreamTransportOptions) => void;
    constructor(plugin: string);
}
