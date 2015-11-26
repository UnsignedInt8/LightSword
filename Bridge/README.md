# LightSword Bridge

LightSword 中转服务器

使用npm安装LightSword Bridge:

```
$> [sudo] npm install -g lightsword-bridge
$> lsbridge -s server_addr -p server_port -l local_port -f
```

之后再把LightSword Client指向中转服务器。把中转服务器搭建在云提供商的主机上，可以加速访问墙外。

```
$> lslocal -s bridge_address -p bridge_port -f
```