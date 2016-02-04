//-----------------------------------
// Copyright(c) 2015 Neko
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
var connectHandler_1 = require('./connectHandler');
var udpHandler_1 = require('./udpHandler');
var socks5constant_1 = require('../../common/socks5constant');
var socks5Helper = require('../../common/socks5helper');
var addressHelper_1 = require('../lib/addressHelper');
function handleSocks5(client, data, options) {
    let dst = socks5Helper.refineDestination(data);
    if (!dst)
        return false;
    if (addressHelper_1.isIllegalAddress(dst.addr)) {
        client.dispose();
        return true;
    }
    switch (dst.cmd) {
        case socks5constant_1.REQUEST_CMD.CONNECT:
            connectHandler_1.connect(client, data, dst, options);
            break;
        case socks5constant_1.REQUEST_CMD.BIND:
            break;
        case socks5constant_1.REQUEST_CMD.UDP_ASSOCIATE:
            udpHandler_1.udpAssociate(client, data, dst, options);
            break;
        default:
            return false;
    }
    return true;
}
exports.handleSocks5 = handleSocks5;
