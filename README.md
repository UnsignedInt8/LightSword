# LightSword

[![Build Status](https://travis-ci.org/SunshinyNeko/LightSword.svg)](https://travis-ci.org/SunshinyNeko/LightSword)

光刃——基于Node的SOCKS5代理。

光刃参见了Shadowsocks的协议，并用Node.js实现。光刃基于Node.js 4.0＋，因此需要首先安装Node.js 4.0 以上版本，点击访问[官方网址](https://nodejs.org)。

安装好Node之后，即可安装LightSword。目前中国并没有封杀npmjs.org，因此可以直接安装：

1.安装
```
[sudo] npm install lightsword -g
```

2.运行

服务器：
```
lsserver -p port -m aes-256-cfb -k xxx
```

客户端：
```
lslocal -s server_addr -p server_port -m aes-256-cfb -l 1080
```

配置你的浏览器及其它需要科学上网的软件使用光刃提供的SOCKS5代理。

默认监听地址：localhost
端口: 1080

License
---
GPLv2.0
