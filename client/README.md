# LightSword 客户端

运行参数:
---

| 参数 | 完整参数 | 解释 |
| -----| -------- | ---- |
| -s | --server | 远程服务器地址 |
| -p | --port | 远程服务器端口 |
| -l | --listenport | 本地监听端口 |
| -m | --method | 加密算法（见下） |
| -k | --password | 密码 |
| -t | --timeout | 超时时常 |
| -f | --fork | 作为守护进程运行 (不支持 Windows) |
| -b | --dontbypasslocal | 不绕过本地地址 |
| -c | --config | 配置文件路径 |
| -a | --any | 允许任意地址使用代理 |
| -d | --daemon | 守护进程控制命令，支持: stop, restart |

控制守护进程

```
// 重启
lslocal -d restart

// 停止
lslocal -d stop
```

支持加密算法:
---

| 算法 |
|----------|
|aes-128-cfb|
|aes-192-cfb|
|aes-256-cfb|
|aes-256-cbc|
|aes-256-ofb|
|bf-cfb|
|camellia-128-cfb|
|camellia-192-cfb|
|camellia-256-cfb|
|cast5-cfb|
|des-cfb|
|idea-cfb|
|rc2-cfb|
|rc4|
|rc4-md5|
|seed-cfb|
