//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

const os = require('os');
const dns = require('dns');
const ipaddr = require('ipaddr');
const socks5Const = require('../socks5Const');
const logger = require('winston');

const hostname = os.hostname();
let hostIP;
let hostIPFamily;
let socks5Reply;

function getHostIp(callback) {
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
  
  getHostIp((ip, family) => {
    let bndAddr = ipaddr.parse(ip).toByteArray();
    let atyp = family === 4 ? socks5Const.ATYP.IPV4 : socks5Const.ATYP.IPV6;
    const bytes = [0x05, 0x00, 0x00, atyp, bndAddr.length].concat(bndAddr).concat([0, 0]);;
      
    socks5Reply = new Buffer(bytes);
    let cpy = new Buffer(socks5Reply.byteLength);
    socks5Reply.copy(cpy);
    callback(cpy);
  });
}

module.exports = {
  getHostIp,
  getDefaultSocks5Reply
}