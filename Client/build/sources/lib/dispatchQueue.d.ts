export interface IDispatchReceiver {
    receive: (msg: string, args: any) => void;
}
export declare class DispatchQueue {
    private _store;
    register(msg: string, receiver: IDispatchReceiver): boolean;
    unregister(msg: string, receiver: IDispatchReceiver): boolean;
    publish(msg: string, things: any): boolean;
}
export declare let defaultQueue: DispatchQueue;
