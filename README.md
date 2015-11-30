# LightSword

[![Build Status](https://travis-ci.org/SunshinyNeko/LightSword.svg)](https://travis-ci.org/SunshinyNeko/LightSword)

光刃——基于Node的科学上网工具

光刃是按照前辈程序员开发的Shadowsocks为原型开发的SOCKS5代理工具。目前为开发预览版，可以尝鲜试用。

基于Node 4.0＋，因此需要首先安装Node.js，点击访问[官方网址](https://nodejs.org)。

如果你需要多版本管理，推荐安装n：
```
[sudo] npm install n -g
n 4.2.2
```

安装好Node之后，即可安装LightSword：

1.客户端安装
```
[sudo] npm install lightsword-client -g
```
2.服务器端安装
```
[sudo] npm install lightsword -g
```

由于模仿Shadowsocks，因此运行参数也是相同的。

服务器：
```
lsserver -p port -m aes-256-cfb -k xxx
```

客户端：
```
lslocal -s server_addr -p server_port -m aes-256-cfb -l 1080
```

配置你的浏览器及其它需要科学上网的软件使用SOCKS5代理: localhost 1080


0.1.4版本暂时不支持（兼容）配置文件

未来计划：

1.支持Shadowsocks协议（插件开发，可以自己编写协议和其它扩展，如流量混淆）

2.UDP支持

3.多用户支持

License
---
GPLv2.0
