import * as net from 'net';
import { REQUEST_CMD } from './consts';
export interface ISocks5Options {
    cipherAlgorithm: string;
    password: string;
    dstAddr: string;
    dstPort: number;
    timeout?: number;
}
export interface IStreamTransportOptions extends ISocks5Options {
    clientSocket: net.Socket;
}
export interface ISocks5 {
    negotiate: (options: ISocks5Options, callback: (result: boolean, reason?: string) => void) => void;
    sendCommand: (options: ISocks5Options, callback: (result: boolean, reason?: string) => void) => void;
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
