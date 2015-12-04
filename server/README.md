# LightSword 服务器端

运行参数
---

| 参数 | 完整参数 | 解释 |
|------|----------|------|
| -p   | --port   | 监听端口 |
| -k   | --password| 密码 |
| -m   | --method | 加密算法 (参见客户端） |
| -c   | --config | 配置文件路径 |
| -t   | --timeout| 超时时长 |
| -f   | --fork   | 作为守护进程运行 (不支持 Windows) |
| -u   | --users  | 多用户配置文件路径 |
| -d   | --daemon | 守护进程控制命令，支持: stop, restart |


使用方法
---

```
lsserver -f -m aes-256-cfb -p 4433 -k password
```