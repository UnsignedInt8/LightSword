import { IDispatchReceiver } from './lib/dispatchQueue';
import { IPluginGenerator } from './socks5/interfaces';
import * as consts from './socks5/consts';
export declare class App implements IDispatchReceiver {
    connectPlugin: IPluginGenerator;
    isLocalProxy: boolean;
    msgMapper: Map<consts.REQUEST_CMD, any>;
    constructor(options?: any);
    receive(msg: any, args: any): void;
}
