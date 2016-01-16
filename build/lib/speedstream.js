//-----------------------------------
// Copyright(c) 2016 Neko
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
var stream = require('stream');
class SpeedStream extends stream.Transform {
    // speed: KB/s
    constructor(speed) {
        super();
        this.bytesPerSecond = 0;
        this.queue = [];
        this.isDataDelivering = false;
        if (speed < 1)
            throw Error('can be negative speed');
        this.bytesPerSecond = speed * 1024;
    }
    _transform(data, encoding, callback) {
        let me = this;
        this.queue.push({ data, callback });
        if (!this.intervalTimer)
            this.intervalTimer = setInterval(this.deliverData, 1000);
    }
    deliverData() {
        if (this.isDataDelivering)
            return;
        this.isDataDelivering = true;
        let sentBytes = 0;
        do {
            let tuple = this.queue.shift();
            if (!tuple) {
                clearInterval(this.intervalTimer);
                this.intervalTimer.unref();
                this.intervalTimer = undefined;
                return;
            }
            this.push(tuple.data);
            tuple.callback();
            sentBytes += tuple.data.length;
        } while (sentBytes < this.bytesPerSecond);
        this.isDataDelivering = false;
    }
}
exports.SpeedStream = SpeedStream;
