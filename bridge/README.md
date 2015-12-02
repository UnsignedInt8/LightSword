# LightSword 中转站

运行参数
---

| 参数 | 完整参数 | 解释 |
|------|----------|------|
| -s | --server | 下个中转服务器地址或目标服务器地址 |
| -p | --port | 下个中转服务器端口或目标服务器端口 |
| -l | --listenport | 本地监听端口 (即客户端连接中转站的该端口) |
| -f | --fork | 作为守护进程运行 (不支持 Windows) |

使用方法
---

1.安装并运行

```
$> [sudo] npm install -g lightsword
$> lsbridge -s server_addr -p server_port -l listen_port -f
```

2.指向中转站

把LightSword 客户端指向中转服务器。把中转服务器搭建在墙内云提供商的主机上，可以加速访问墙外。

```
$> lslocal -s bridge_address -p bridge_port -f
```