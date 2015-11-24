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
var consts_1 = require('./consts');
class PluginPivot {
    constructor(plugin) {
        this.components = new Map();
        this.cmdMap = new Map();
        let _this = this;
        this.cmdMap.set(consts_1.REQUEST_CMD.BIND, 'bind');
        this.cmdMap.set(consts_1.REQUEST_CMD.CONNECT, 'connect');
        this.cmdMap.set(consts_1.REQUEST_CMD.UDP_ASSOCIATE, 'udpAssociate');
        ['connect' /* , 'bind' */, 'udpAssociate'].forEach(c => _this.components.set(c, require(`../plugins/${plugin}.${c}`)));
    }
    getSocks5(cmd) {
        return new (this.components.get(this.cmdMap.get(cmd)))();
    }
}
exports.PluginPivot = PluginPivot;
//# sourceMappingURL=plugin.js.map