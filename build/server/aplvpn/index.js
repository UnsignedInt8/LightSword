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
var protocols_1 = require('./protocols');
const SupportedIPVers = [protocols_1.IP_VER.V4, protocols_1.IP_VER.V6];
const SupportedProtocols = [protocols_1.Protocols.TCP, protocols_1.Protocols.UDP];
function handleAppleVPN(client, handshakeData, options) {
    let handshake = null;
    try {
        handshake = extractHandeshake(handshakeData);
        if (!SupportedIPVers.contains(handshake.ipVer))
            return false;
        if (!SupportedProtocols.contains(handshake.payloadProtocol))
            return false;
    }
    catch (error) {
        return false;
    }
    switch (handshake.payloadProtocol) {
        case protocols_1.Protocols.TCP:
            break;
        case protocols_1.Protocols.UDP:
            break;
    }
    return true;
}
exports.handleAppleVPN = handleAppleVPN;
function extractHandeshake(data) {
    let ipVer = data[0];
    let payloadProtocol = data[1];
    let flags = data[2];
    let ipLength = ipVer == protocols_1.IP_VER.V4 ? 4 : 16;
    let destAddress = data.skip(3).take(ipLength).toArray();
    let destPort = data.readUInt16BE(3 + ipLength);
    let extra = data.slice(3 + ipLength + 2);
    return { ipVer, payloadProtocol, flags, destAddress, destPort, extra };
}
