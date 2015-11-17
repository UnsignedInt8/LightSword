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
//# sourceMappingURL=main.js.map