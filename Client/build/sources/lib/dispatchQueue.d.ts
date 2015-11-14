export declare type Receiver = {
    receive(msg: string, args: any);
};
export declare class DispatchQueue {
    private _store;
    register(msg: string, receiver: Receiver): boolean;
    unregister(msg: string, receiver: Receiver): boolean;
    publish(msg: string, things: any): boolean;
}
export declare let defaultQueue: DispatchQueue;
