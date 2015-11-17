import * as net from 'net';
export interface IBasicOptions {
    cipherAlgorithm: string;
    password: string;
}
export interface INegotiationOptions extends IBasicOptions {
    clientSocket: net.Socket;
}
export interface ICommandOptions extends INegotiationOptions {
    data: any;
}
export interface IStreamTransportOptions extends INegotiationOptions {
    clientSocket: net.Socket;
}
export declare enum Socks5CommandType {
    connect = 1,
    bind = 2,
    udpAssociate = 3,
}
export interface IPluginPivot {
    negotiate: (options: INegotiationOptions, callback: (success: boolean, reason?: string) => void) => void;
    resolveCommandType: (options: INegotiationOptions, callback: (success: boolean, cmdType: Socks5CommandType, data: any, reason?: string) => void) => void;
    processCommand: (options: ICommandOptions, callback: (success: boolean, reason?: string) => void) => void;
    transportStream: (options: IStreamTransportOptions) => void;
}
export declare class PluginPivot implements IPluginPivot {
    negotiate: (options: INegotiationOptions, callback: (success: boolean, reason?: string) => void) => void;
    resolveCommandType: (options: INegotiationOptions, callback: (success: boolean, cmdType: Socks5CommandType, data: any, reason?: string) => void) => void;
    processCommand: (options: ICommandOptions, callback: (success: boolean, reason?: string) => void) => void;
    transportStream: (options: IStreamTransportOptions) => void;
    constructor(plugin: string);
}
