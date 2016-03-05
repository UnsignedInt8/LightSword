//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const crypto = require('crypto');
exports.SupportedCiphers = {
    'aes-128-cfb': [16, 16],
    'aes-128-ofb': [16, 16],
    'aes-192-cfb': [24, 16],
    'aes-192-ofb': [24, 16],
    'aes-256-cfb': [32, 16],
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
    'seed-cfb': [16, 16],
};
Object.freeze(exports.SupportedCiphers);
function createCipher(algorithm, password, iv) {
    return createDeOrCipher('cipher', algorithm, password, iv);
}
exports.createCipher = createCipher;
function createDecipher(algorithm, password, iv) {
    return createDeOrCipher('decipher', algorithm, password, iv).cipher;
}
exports.createDecipher = createDecipher;
function createDeOrCipher(type, algorithm, password, iv) {
    let cipherAlgorithm = algorithm.toLowerCase();
    let keyIv = exports.SupportedCiphers[cipherAlgorithm];
    if (!keyIv) {
        cipherAlgorithm = 'aes-256-cfb';
        keyIv = exports.SupportedCiphers[cipherAlgorithm];
    }
    let key = new Buffer(password);
    let keyLength = keyIv[0];
    if (key.length > keyLength)
        key = key.slice(0, keyLength);
    if (key.length < keyLength)
        key = new Buffer(password.repeat(keyLength / password.length + 1)).slice(0, keyLength);
    iv = iv || crypto.randomBytes(keyIv[1]);
    let cipher = type === 'cipher' ? crypto.createCipheriv(cipherAlgorithm, key, iv) : crypto.createDecipheriv(cipherAlgorithm, key, iv);
    return { cipher: cipher, iv: iv };
}
