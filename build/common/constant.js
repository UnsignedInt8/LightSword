//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
(function (VPN_TYPE) {
    VPN_TYPE[VPN_TYPE["APLVPN"] = 1] = "APLVPN";
    VPN_TYPE[VPN_TYPE["SOCKS5"] = 5] = "SOCKS5";
    VPN_TYPE[VPN_TYPE["OSXCL5"] = 165] = "OSXCL5";
})(exports.VPN_TYPE || (exports.VPN_TYPE = {}));
var VPN_TYPE = exports.VPN_TYPE;
exports.defaultCipherAlgorithm = 'aes-256-cfb';
exports.defaultPassword = 'lightsword.neko';
exports.defaultServerPort = 8900;
class Socks5Options {
}
exports.Socks5Options = Socks5Options;
class OSXCl5Options extends Socks5Options {
}
exports.OSXCl5Options = OSXCl5Options;
