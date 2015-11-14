//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
class DispatchQueue {
    constructor() {
        this._store = new Map();
    }
    register(msg, receiver) {
        let subscribers = this._store.get(msg);
        if (!subscribers) {
            subscribers = [];
            subscribers.push(receiver);
            this._store.set(msg, subscribers);
            return true;
        }
        if (subscribers.contains(receiver))
            return false;
        subscribers.push(receiver);
        return true;
    }
    unregister(msg, receiver) {
        let subscribers = this._store.get(msg);
        if (!subscribers)
            return false;
        let index = subscribers.indexOf(receiver);
        if (index < 0)
            return false;
        subscribers.splice(index, 1);
        return true;
    }
    publish(msg, things) {
        let subscribers = this._store.get(msg);
        if (!subscribers)
            return false;
        process.nextTick(() => {
            subscribers.forEach(item => item.receive(msg, things));
        });
        return true;
    }
}
exports.DispatchQueue = DispatchQueue;
exports.defaultQueue = new DispatchQueue();
