//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------
'use strict';
(function (IP_VER) {
    IP_VER[IP_VER["V4"] = 4] = "V4";
    IP_VER[IP_VER["V6"] = 6] = "V6";
})(exports.IP_VER || (exports.IP_VER = {}));
var IP_VER = exports.IP_VER;
(function (Protocols) {
    Protocols[Protocols["TCP"] = 6] = "TCP";
    Protocols[Protocols["UDP"] = 17] = "UDP";
})(exports.Protocols || (exports.Protocols = {}));
var Protocols = exports.Protocols;
