import * as net from 'net';
export interface IBasicOptions {
    cipherAlgorithm: string;
    password: string;
}
export interface INegotitationOptions extends IBasicOptions {
    clientSocket: net.Socket;
}
export declare type INegotiationOptions = INegotitationOptions;
export interface IStreamTransportOptions extends INegotitationOptions {
    clientSocket: net.Socket;
}
export interface IPluginPivot {
    negotiate: (options: INegotiationOptions, finishCallback: (result: boolean, reason?: string) => void) => void;
    transportStream: (options: IStreamTransportOptions) => void;
}
export declare class PluginPivot implements IPluginPivot {
    negotiate: (options: INegotiationOptions) => boolean;
    transportStream: (options: IStreamTransportOptions) => void;
    constructor(plugin: string);
}
