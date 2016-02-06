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
var dgram = require('dgram');
function handleUDP(client, handshake, options) {
    let udpType = handshake.ipVer == IP_VER.V4 ? 'udp4' : 'udp6';
    let udpSocket = dgram.createSocket(udpType, (msg, rinfo) => __awaiter(this, void 0, Promise, function* () {
    }));
    let destAddress = udpSocket.send(handshake.extra, 0, handshake.extra.length, handshake.destPort);
}
exports.handleUDP = handleUDP;
