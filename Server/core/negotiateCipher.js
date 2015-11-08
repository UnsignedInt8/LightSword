//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const net = require('net');
const crypto = require('crypto');

/**
 * options: {
 *    socket,
 *    password
 * }
 * 
 * callback: (err, cipherKey, verificationNum) => void
 */
function negotiateCipher(options, callback) {
  let socket = options.socket;
  let cipherAlgorithm = options.cipherAlgorithm;
  let password = options.password;
  
  let decipher = crypto.createDecipher(cipherAlgorithm, password);
  
  socket.on('data', (data) => {
    let buf = Buffer.concat([decipher.update(data), decipher.final()]);
    
    try {
      let handshake = JSON.parse(buf.toString('utf8'));
      let lightSword = handshake.lightSword;
      let cipherKey = handshake.cipherKey;
      let clientCipherAlgorithm = handshake.cipherAlgorithm;
      let okNum = handshake.verificationNum;
      let fields = [lightSword, cipherKey, okNum, clientCipherAlgorithm];
      if (fields.any(f => f === null || f === undefined)) return callback(new Error('Fields lost'));
      if (typeof handshake.verificationNum !== 'number') return callback(new Error('Not recognizable data!!!'));
      if (cipherAlgorithm !== clientCipherAlgorithm) return callback(new Error('Cipher algorithm not equal'));
      
      let welcome = {
        okNum: ++okNum
      };
      
      socket.write(new Buffer(JSON.stringify(welcome)));
      callback(null, cipherKey, okNum);
    } catch(ex) {
      callback(ex);
    }
  })
}

module.exports = negotiateCipher;