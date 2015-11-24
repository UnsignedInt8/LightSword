//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
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
//# sourceMappingURL=dispatchQueue.js.map