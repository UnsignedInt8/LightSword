//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
var crypto = require('crypto');
let SupportedCiphers = {
    'aes-128-cfb': [16, 16],
    'aes-192-cfb': [24, 16],
    'aes-256-cfb': [32, 16],
    'aes-256-cbc': [32, 16],
    'aes-256-ofb': [32, 16],
    'bf-cfb': [16, 8],
    'camellia-128-cfb': [16, 16],
    'camellia-192-cfb': [24, 16],
    'camellia-256-cfb': [32, 16],
    'cast5-cfb': [16, 8],
    'des-cfb': [8, 8],
    'idea-cfb': [16, 8],
    'rc2-cfb': [16, 8],
    'rc4': [16, 0],
    'rc4-md5': [16, 16],
    'seed-cfb': [16, 16]
};
function createCipher(algorithm, password) {
    let cipherAlgorithm = algorithm.toLowerCase();
    let keyIv = SupportedCiphers[algorithm];
    if (!keyIv) {
        cipherAlgorithm = 'aes-256-cfb';
        keyIv = SupportedCiphers[cipherAlgorithm];
    }
    let key = new Buffer(password);
    if (key.length > keyIv[1])
        key = key.slice(0, keyIv[1]);
    if (key.length < keyIv[1])
        key = Buffer.concat([key, crypto.randomBytes(keyIv[1] - key.length)]);
    let iv = crypto.randomBytes(keyIv[1]);
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    return { cipher: cipher, iv: iv };
}
exports.createCipher = createCipher;
