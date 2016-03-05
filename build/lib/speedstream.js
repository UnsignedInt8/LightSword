//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------
'use strict';
const stream = require('stream');
class SpeedStream extends stream.Transform {
    /**
     * speed: KB/s
     */
    constructor(speed) {
        super();
        this.bytesPerSecond = 0;
        this.sentBytes = 0;
        this.chunkCount = 0;
        this.interval = 0;
        if (speed < 1)
            throw Error('can be negative speed');
        this.bytesPerSecond = speed * 1024;
    }
    _transform(chunk, encoding, done) {
        let me = this;
        if (!me.writable)
            return;
        setTimeout(() => {
            if (!me.writable) {
                me.interval = 0;
                me.sentBytes = 0;
                me.chunkCount = 0;
                return;
            }
            me.push(chunk, encoding);
            done();
            if (me.sentBytes > me.bytesPerSecond) {
                let avgChunkSize = me.sentBytes / me.chunkCount;
                me.interval = avgChunkSize / me.bytesPerSecond * 1000;
                me.sentBytes = 0;
                me.chunkCount = 0;
            }
        }, me.interval).unref();
        me.sentBytes += chunk.length;
        me.chunkCount++;
    }
}
exports.SpeedStream = SpeedStream;
