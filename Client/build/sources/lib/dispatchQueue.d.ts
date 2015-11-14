export interface IReceiver {
    receive: (msg: string, args: any) => void;
}
export declare class DispatchQueue {
    private _store;
    register(msg: string, receiver: IReceiver): boolean;
    unregister(msg: string, receiver: IReceiver): boolean;
    publish(msg: string, things: any): boolean;
}
export declare let defaultQueue: DispatchQueue;
