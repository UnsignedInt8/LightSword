import * as net from 'net';
import { REQUEST_CMD } from '../socks5/consts';
export interface IBasicOptions {
    cipherAlgorithm: string;
    password: string;
}
export interface INegotiationOptions extends IBasicOptions {
    proxySocket: net.Socket;
}
export interface ICommandOptions extends INegotiationOptions {
    dstAddr: string;
    dstPort: number;
}
export interface IStreamTransportOptions extends INegotiationOptions {
    clientSocket: net.Socket;
}
export interface ISocks5 {
    negotiate: (options: INegotiationOptions, callback: (result: boolean, reason?: string) => void) => void;
    sendCommand: (options: ICommandOptions, callback: (result: boolean, reason?: string) => void) => void;
    fillReply?: (reply: Buffer) => Buffer;
    transport?: (options: IStreamTransportOptions) => void;
}
export interface ISocks5Plugin {
    getSocks5: (cmd: REQUEST_CMD) => ISocks5;
}
export declare class PluginPivot implements ISocks5Plugin {
    components: Map<string, any>;
    cmdMap: Map<REQUEST_CMD, string>;
    constructor(plugin: string);
    getSocks5(cmd: REQUEST_CMD): ISocks5;
}
