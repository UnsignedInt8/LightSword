'use strict'

const Socks5Server = require('../build/socks5/localServer').LocalServer;
const assert = require('assert');

describe('test server', () => {
  it('start server', () => {
    let s = new Socks5Server();
    s.port = 4090;
    assert(s.start());    
  })
})
