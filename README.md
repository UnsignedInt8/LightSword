# LightSword

[![Build Status](https://travis-ci.org/SunshinyNeko/LightSword.svg)](https://travis-ci.org/SunshinyNeko/LightSword)

光刃——基于 Node.js 的 SOCKS5 代理。

光刃参考了Shadowsocks的协议，并用 Typescript 实现。光刃基于Node.js 4.0＋，因此需要首先安装Node.js 4.0 以上版本，点击访问[官方网址](https://nodejs.org)。


Quick Start
---

首先，安装Node.js 4.0+，安装好Node.js之后，即可使用Node.js的包管理器npm安装LightSword。目前中国并没有封杀npmjs.org，因此可以直接安装：


1.安装
```
[sudo] npm install lightsword -g
```

安装完成之后，即可使用客户端，服务器端，中转站端。

服务器端: lsserver, lightsword-server, lightsword

中转站端: lsbridge, lightsword-bridge

客户端: lslocal, lightsword-client

简单的说明下中转站的作用: 由于大家都懂的，访问境外IP时不时丢包非常严重，因此可以把中转站搭建在墙内的云提供商服务器上，作为墙内到墙外的中转，具有较好的效果。

2.运行

服务器：
```
lsserver -p port -m aes-256-cfb -k xxx
```

客户端：
```
lslocal -s server_addr -p server_port -m aes-256-cfb -l 1080
```

中转站：
```
lsbridge -s server_addr -p server_port
```

配置你的浏览器及其它需要科学上网的软件使用光刃提供的SOCKS5代理。

默认监听地址: localhost

端口: 1080

详细参数请参见源码文件夹中的 README.md 文件

License
---
GPLv2.0
