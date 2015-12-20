//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
(function (VPN_TYPE) {
    VPN_TYPE[VPN_TYPE["SOCKS5"] = 5] = "SOCKS5";
    VPN_TYPE[VPN_TYPE["OSXCL5"] = 165] = "OSXCL5";
})(exports.VPN_TYPE || (exports.VPN_TYPE = {}));
var VPN_TYPE = exports.VPN_TYPE;
exports.defaultCipherAlgorithm = 'aes-256-cfb';
exports.defaultPassword = 'lightsword.neko';
exports.defaultServerPort = 8900;
