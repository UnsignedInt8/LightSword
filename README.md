# LightSword

[![Build Status](https://travis-ci.org/UnsignedInt8/LightSword.svg?branch=master)](https://travis-ci.org/UnsignedInt8/LightSword)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/UnsignedInt8/LightSword?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

LightSword —— 基于 Node.js 的 SOCKS5 代理 / Apple NE 服务器。

LightSword 参考了 Shadowsocks 的协议，并用 Typescript 实现。LightSword 基于 Node.js 4.0＋，因此需要首先安装 Node.js 4.0  以上版本，点击访问[官方网址](https://nodejs.org)。


Quick Start
---

首先，安装Node.js 4.0+，安装好 Node.js 之后，即可使用 Node.js 的包管理器 npm 安装 LightSword 。目前 npmjs.org 可以访问，因此可以直接安装：


1.安装
```
[sudo] npm install lightsword -g
```

安装完成之后，即可使用客户端，服务器端，中转站端。

服务器端: lsserver, lightsword-server, lightsword

中转站端: lsbridge, lightsword-bridge

客户端: lslocal, lightsword-client

简单地说明下中转站的作用: 

由于某些不为人知的原因，访问境外IP时不时丢包非常严重，因此可以把中转站搭建在云提供商服务器上，作为中转／中继使用，具有较好的效果（在一定程度上提高了匿名性）。

2.运行

服务器：
```
lsserver -f
```

客户端：
```
lslocal -s server_addr -f
```

中转站：
```
lsbridge -s server_addr -f
```

以上配置均使用内置默认设置，详细参数请参见源码文件夹中的 README.md 文件（参见: server, client, bridge 这三个文件夹）。

> 经实际测试，中转服务器对 Shadowsocks 有效。理论上支持任何形式的 TCP 流量中转。

最后配置你的浏览器及其它需要上网的软件使用 LightSword 提供的 SOCKS5 代理。

默认监听地址: localhost

端口: 1080

Linux 支持
---

在 `'misc'` 文件夹下，已经写好了 Linux 启动脚本，你可以根据自己的实际情况，修改运行参数。并放到 init.d 目录下，再 `chkconfig on` 或者其它 Linux 分发版的命令激活自动运行即可。

Apple 用户
---

Apple 用户只需要运行服务器，即可打开iOS客户端填写配置并投入使用。如需测试 DNS 泄漏，请访问[https://dnsleaktest.com](https://dnsleaktest.com)。

建议在运行的时候加入 --cluster 参数，以提升服务器性能和稳定性。

License
---

GPLv2.0
