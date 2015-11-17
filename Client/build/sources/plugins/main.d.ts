import * as net from 'net';
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
    transportStream?: (options: IStreamTransportOptions) => void;
}
export interface ISocks5Plugin {
    getConnect: () => ISocks5;
    getBind: () => ISocks5;
    getUdpAssociate: () => ISocks5;
}
export declare class PluginPivot implements ISocks5Plugin {
    components: Map<string, any>;
    constructor(plugin: string);
    getConnect(): ISocks5;
    getBind(): ISocks5;
    getUdpAssociate(): ISocks5;
}
