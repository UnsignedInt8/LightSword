//-----------------------------------
// Copyright(c) 2016 Neko
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const crypto = require('crypto');
const protocols_1 = require('./protocols');
const cryptoEx = require('../../common/cipher');
const addrHelper = require('../lib/addressHelper');
const udp_1 = require('./udp');
const tcp_1 = require('./tcp');
const SupportedIPVers = [protocols_1.IP_VER.V4, protocols_1.IP_VER.V6];
const SupportedProtocols = [protocols_1.Protocols.TCP, protocols_1.Protocols.UDP];
function handleAppleVPN(client, handshakeData, options) {
    return __awaiter(this, void 0, Promise, function* () {
        if (handshakeData.length < 9)
            return false;
        let handshake = null;
        try {
            handshake = extractHandeshake(handshakeData);
            if (!SupportedIPVers.contains(handshake.ipVer))
                return false;
            if (!SupportedProtocols.contains(handshake.payloadProtocol))
                return false;
        }
        catch (error) {
            return false;
        }
        if (handshake.flags === 0x00 && handshake.destHost === '0.0.0.0' && handshake.destPort === 0) {
            try {
                yield handleHandshake(client, handshake, options);
            }
            catch (error) {
                return false;
            }
            return true;
        }
        if (addrHelper.isIllegalAddress(handshake.destHost)) {
            client.dispose();
            return true;
        }
        switch (handshake.payloadProtocol) {
            case protocols_1.Protocols.TCP:
                tcp_1.handleTCP(client, handshake, options);
                return true;
            case protocols_1.Protocols.UDP:
                udp_1.handleUDP(client, handshake, options);
                return true;
        }
        return false;
    });
}
exports.handleAppleVPN = handleAppleVPN;
function extractHandeshake(data) {
    let ipVer = data[0];
    let payloadProtocol = data[1];
    let flags = data[2];
    let ipLength = ipVer == protocols_1.IP_VER.V4 ? 4 : 16;
    let destAddress = data.skip(3).take(ipLength).toArray();
    let destPort = data.readUInt16BE(3 + ipLength);
    let extra = data.slice(3 + ipLength + 2);
    let destHost = addrHelper.ntoa(destAddress);
    return { ipVer: ipVer, payloadProtocol: payloadProtocol, flags: flags, destAddress: destAddress, destHost: destHost, destPort: destPort, extra: extra };
}
function handleHandshake(client, handshake, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, handshake.extra).cipher;
        let md5 = crypto.createHash('md5').update(handshake.extra).digest();
        let randomPadding = new Buffer(Number((Math.random() * 128).toFixed()));
        client.on('error', () => { });
        yield client.writeAsync(Buffer.concat([cipher.update(md5), cipher.update(randomPadding)]));
        client.dispose();
    });
}
