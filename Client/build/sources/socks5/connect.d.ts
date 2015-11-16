import * as net from 'net';
import { RequestOptions } from './localServer';
import { IPluginPivot } from '../plugins/main';
export declare class Socks5Connect {
    cipherAlgorithm: string;
    password: string;
    dstAddr: string;
    dstPort: number;
    serverAddr: string;
    serverPort: number;
    clientSocket: net.Socket;
    timeout: number;
    pluginPivot: IPluginPivot;
    constructor(plugin: IPluginPivot, args: RequestOptions, isLocal?: boolean);
    connectServer(): void;
}
