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
var socks5Constant_1 = require('../../lib/socks5Constant');
var socks5Helper = require('../../lib/socks5Helper');
var connectHandler_1 = require('./connectHandler');
function handleSocks5(client, data) {
    let dst = socks5Helper.refineDestination(data);
    switch (dst.cmd) {
        case socks5Constant_1.REQUEST_CMD.CONNECT:
            connectHandler_1.connect(client, dst.addr, dst.port);
            break;
    }
}
exports.handleSocks5 = handleSocks5;
