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
var app_1 = require('../app');
function getUserCount(req, res) {
    let data = {
        count: app_1.App.Users.size
    };
    res.json(data);
}
exports.getUserCount = getUserCount;
function addUser(req, res) {
    var body = req.body;
    let success = app_1.App.addUser(body);
    let data = {
        success
    };
    res.json(data);
}
exports.addUser = addUser;
