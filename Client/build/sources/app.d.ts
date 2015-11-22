import { IDispatchReceiver } from './lib/dispatchQueue';
import * as consts from './socks5/consts';
import { PluginPivot } from './plugins/main';
export declare class App implements IDispatchReceiver {
    pluginPivot: PluginPivot;
    localPlugin: PluginPivot;
    bypassLocal: boolean;
    isLocalProxy: boolean;
    msgMapper: Map<consts.REQUEST_CMD, any>;
    constructor(options?: any);
    receive(msg: any, args: any): void;
}
