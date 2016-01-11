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
var kinq = require('kinq');
function getUserCount(req, res) {
    res.json({ count: app_1.App.Users.size });
}
exports.getUserCount = getUserCount;
function getUsers(req, res) {
    let users = app_1.App.Users.select(item => { return { port: item[1].port, cipherAlgorithm: item[1].cipherAlgorithm, expireDate: item[1].expireDate }; }).toArray();
    res.json(users);
}
exports.getUsers = getUsers;
function addUser(req, res) {
    var body = req.body;
    let success = Array.isArray(body) ? app_1.App.addUsers(body) : app_1.App.addUser(body);
    let statusCode = success ? 200 : 400;
    let data = {
        success,
        msg: success ? undefined : `Port number: ${body.port} is used or access denied`
    };
    res.status(statusCode).json(data);
}
exports.addUser = addUser;
function updateUser(req, res) {
    var body = req.body;
    let success = app_1.App.updateUser(Number(req.params.port), body);
    let statusCode = success ? 200 : 404;
    let data = {
        success,
        msg: success ? undefined : 'User Not Found'
    };
    res.status(statusCode).json(data);
}
exports.updateUser = updateUser;
function deleteUser(req, res) {
    var port = Number(req.params.port);
    let success = app_1.App.removeUser(port);
    let statusCode = success ? 200 : 404;
    let data = {
        success,
        msg: success ? undefined : 'User Not Found'
    };
    res.status(404).json(data);
}
exports.deleteUser = deleteUser;
function getBlacklist(req, res) {
    let data = kinq.toLinqable(app_1.App.Users.values()).select(server => server.blackIPs).flatten(false).toArray();
    res.status(data.length > 0 ? 200 : 404).json(data);
}
exports.getBlacklist = getBlacklist;
function getBlacklistCount(req, res) {
    let count = kinq.toLinqable(app_1.App.Users.values()).select(s => s.blackIPs.size).sum();
    res.json({ count });
}
exports.getBlacklistCount = getBlacklistCount;
function getServerOfPort(req, res, next) {
    let server = kinq.toLinqable(app_1.App.Users.values()).singleOrDefault(s => s.port === Number(req.params.port), undefined);
    if (!server) {
        return res.status(404).json({ success: false, msg: 'User Not Found' });
    }
    req.user = server;
    next();
}
exports.getServerOfPort = getServerOfPort;
function getBlacklistOfPort(req, res) {
    let server = req.user;
    res.json(server.blackIPs.toArray());
}
exports.getBlacklistOfPort = getBlacklistOfPort;
function getBlacklistCountOfPort(req, res) {
    let server = req.user;
    res.json({ count: server.blackIPs.size });
}
exports.getBlacklistCountOfPort = getBlacklistCountOfPort;
