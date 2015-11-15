import { IDispatchReceiver } from './lib/dispatchQueue';
export declare class App implements IDispatchReceiver {
    constructor(options?: any);
    receive(msg: string, args: any): void;
}
