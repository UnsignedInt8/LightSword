import * as net from 'net';
import { PluginPivot } from '../plugins/main';
export declare class Server {
    cipherAlgorithm: string;
    password: string;
    port: number;
    _server: net.Server;
    _pluginPivot: PluginPivot;
    constructor(options: {
        cipherAlgorithm: string;
        password: string;
        port: number;
        plugin: string;
    });
    start(): void;
    stop(): void;
}
