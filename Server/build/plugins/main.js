//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
(function (Socks5CommandType) {
    Socks5CommandType[Socks5CommandType["connect"] = 1] = "connect";
    Socks5CommandType[Socks5CommandType["bind"] = 2] = "bind";
    Socks5CommandType[Socks5CommandType["udpAssociate"] = 3] = "udpAssociate";
})(exports.Socks5CommandType || (exports.Socks5CommandType = {}));
var Socks5CommandType = exports.Socks5CommandType;
class PluginPivot {
    constructor(plugin) {
        let _this = this;
        ['negotiate', 'transportStream'].forEach(n => _this[n] = require(`./${n}.${plugin}`));
    }
}
exports.PluginPivot = PluginPivot;
//# sourceMappingURL=main.js.map