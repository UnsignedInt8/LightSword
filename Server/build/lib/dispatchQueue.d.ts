export interface IDispatchReceiver {
    receive: (msg: any, args: any) => void;
}
export declare class DispatchQueue {
    private _store;
    register(msg: any, receiver: IDispatchReceiver): boolean;
    unregister(msg: any, receiver: IDispatchReceiver): boolean;
    publish(msg: any, things: any): boolean;
}
export declare let defaultQueue: DispatchQueue;
