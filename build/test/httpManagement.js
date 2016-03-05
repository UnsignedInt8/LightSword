//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const http = require('http');
const assert = require('assert');
require('../server/management/index');
describe('HTTP Management Test Cases', () => {
    before((done) => {
        let data = JSON.stringify({
            port: 35000,
            cipherAlgorithm: 'bf-cfb',
            password: 'abc'
        });
        let options = {
            host: 'localhost',
            port: 5000,
            path: '/api/users',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        let httpReq = http.request(options, res => {
            let msg = '';
            res.on('data', d => msg += d);
            res.on('end', () => {
                let ok = JSON.parse(msg);
                assert(ok.success);
                done();
            });
        });
        httpReq.write(data);
        httpReq.end();
    });
    it('should have 1 user', (done) => {
        http.get('http://localhost:5000/api/users/count', res => {
            let msg = '';
            res.on('data', d => msg += d);
            res.on('end', () => {
                let msgObj = JSON.parse(msg);
                assert(msgObj.count === 1);
                done();
            });
        });
    });
    it('create new users (Array)', (done) => {
        let users = JSON.stringify([
            {
                port: 49000,
                password: '123',
                cipherAlgorithm: 'rc4-md5'
            },
            {
                port: 49001,
                password: 'abce',
                cipherAlgorithm: 'aes-128-cfb'
            }
        ]);
        let options = {
            host: 'localhost',
            port: 5000,
            path: '/api/users',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(users)
            }
        };
        let httpReq = http.request(options, res => {
            let msg = '';
            res.on('data', d => msg += d);
            res.on('end', () => {
                let obj = JSON.parse(msg);
                assert(obj.success);
                done();
            });
        });
        httpReq.write(users);
        httpReq.end();
    });
    it('get users count', (done) => {
        http.get('http://localhost:5000/api/users/count', (res) => {
            let msg = '';
            res.on('data', d => msg += d);
            res.on('end', () => {
                let obj = JSON.parse(msg);
                assert(obj.count === 3);
                done();
            });
        });
    });
    it('delete user', (done) => {
        let options = {
            host: 'localhost',
            port: 5000,
            path: '/api/users/49000',
            method: 'DELETE'
        };
        http.request(options, res => {
            let msg = '';
            res.on('data', d => msg += d);
            res.on('end', () => {
                let obj = JSON.parse(msg);
                assert(obj.success);
                done();
            });
        }).end();
    });
    it('update user expiring', (done) => {
        let data = JSON.stringify({
            expireDate: "2017-01-04T03:01:54+09:00"
        });
        let options = {
            host: 'localhost',
            path: '/api/users/35000',
            port: 5000,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        let httpReq = http.request(options, res => {
            let msg = '';
            res.on('data', d => msg += d);
            res.on('end', () => {
                let obj = JSON.parse(msg);
                assert(obj.success);
                done();
            });
        });
        httpReq.write(data);
        httpReq.end();
    });
    it('update not exist user expiring', (done) => {
        let data = JSON.stringify({
            expireDate: "2017-01-04T03:01:54+09:00"
        });
        let options = {
            host: 'localhost',
            path: '/api/users/350500',
            port: 5000,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        let httpReq = http.request(options, res => {
            let msg = '';
            res.on('data', d => msg += d);
            res.on('end', () => {
                let obj = JSON.parse(msg);
                assert(obj.success === false);
                done();
            });
        });
        httpReq.write(data);
        httpReq.end();
    });
    after((done) => {
        http.get('http://localhost:5000/api/users/count', res => {
            let msg = '';
            res.on('data', d => msg += d);
            res.on('end', () => {
                assert(JSON.parse(msg).count === 2);
                done();
            });
        });
    });
});
