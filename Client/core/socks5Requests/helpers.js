//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const os = require('os');
const dns = require('dns');
const ipaddr = require('ipaddr.js');
const socks5Const = require('../socks5Const');
const logger = require('winston');

const hostname = os.hostname();
let hostIP;
let hostIPFamily;
let socks5Reply;

function getHostIP(callback) {
  
  if (hostIP && hostIPFamily) {
    return process.nextTick(() => {
      callback(hostIP, hostIPFamily);
    });
  }

  dns.lookup(hostname, (err, addr, family) => {
    if (err) {
      logger.error('Can\'t get host ip: ' + err.message);
      return process.exit(1);
    }
    
    hostIP = addr;
    hostIPFamily = family;
    callback(hostIP, hostIPFamily);
  });
}

/**
 * Return socks5 reply buffer
 * 
 * @callback: (buf) => void
 */
function getDefaultSocks5Reply(callback) {
  if (socks5Reply) {
    return process.nextTick(() => {
      let cpy = new Buffer(socks5Reply.byteLength);
      socks5Reply.copy(cpy);
      callback(cpy);
    });
  }
  
  getHostIP((ip, family) => {
    let bndAddr = ipaddr.parse(ip).toByteArray();
    let atyp = family === 4 ? socks5Const.ATYP.IPV4 : socks5Const.ATYP.IPV6;
    const bytes = [0x05, 0x0, 0x0, atyp].concat(bndAddr.toArray()).concat([0x0, 0x0]);

    socks5Reply = new Buffer(bytes);
    let cpy = new Buffer(socks5Reply.byteLength);
    socks5Reply.copy(cpy);
    callback(cpy);
  });
}

module.exports = {
  getHostIP,
  getDefaultSocks5Reply
}