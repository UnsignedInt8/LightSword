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
