# LightSword 服务器端

运行参数
---

| 参数 | 完整参数       | 解释 |
|------|--------------|------|
| -p   | --port       | 监听端口 |
| -k   | --password   | 密码 |
| -m   | --method     | 加密算法 (参见客户端） |
| -c   | --config     | 配置文件路径 |
| -t   | --timeout    | 超时时长 |
| -f   | --fork       | 作为守护进程运行 (不支持 Windows) |
| -u   | --users      | 多用户配置文件路径 |
| -d   | --daemon     | 守护进程控制命令，支持: stop, restart, status |
| -r   | --cluster    | 以集群（多进程）模式运行 |
| -a   | --management | 启用HTTP管理 |


使用方法
---

启动

```
lsserver -f -m aes-256-cfb -p 4433 -k password
```

停止服务器

```
lsserver -d stop
```

重启服务器

```
lsserver -d restart
```

服务器状态

```
lsserver -d status
```

配置文件:
---

配置文件是使用utf8编码的json格式文件，每个配置关键字和命令行完整参数相同。

```
{
  "port": 4433,
  "password": "abcabc",
  "method": "aes-256-cfb",
  "timeout": 60,
  "fork": true,
  "users": "/etc/lightsword-users.conf",
  "cluster": true
}
```