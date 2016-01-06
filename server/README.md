# LightSword 服务器端

运行参数
---

| 参数 | 完整参数       | 解释 |
|------|--------------|------|
| -p   | --port       | 监听端口 |
| -k   | --password   | 密码 |
| -m   | --method     | 加密算法 (参见客户端） |
| -c   | --config     | 配置文件路径 |
| -t   | --timeout    | 超时时长 (单位:秒) |
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

多用户管理:
---

使用 -u (--users) 参数提供多用户配置文件，配置文件请参见 ../misc/users.conf 文件提供的实例。

配置文件为 utf8 编码的文本文件，格式如下:

```
＃ 注释行 <必填项> [可选项］
<Port-Number> <Password> <Cipher-Algorithm> [ISO-8601-Extended-Date-Format-String]

注意: 字段之间用半角空格分割，字段中不允许出现空格
```

管理
---

从 0.5.0 版本开始，LightSword 加入 HTTP 管理功能，为多用户管理带来方便。LightSword 采用 HTTP 协议，并通过 Restful 风格交互，数据传输格式为 JSON。

首先，启用 HTTP 管理:

```
lsserver -a
```

服务器启用后，默认监听本地端口: 5000，你可以使用以下形式访问:

```
http://localhost:5000/api/xxx
```

支持的接口:

| 方法 | 接口     | 解释  |
|--------|------------------|---------------|
| GET    | /api/users       | 获取所有用户信息 |
| GET    | /api/users/count | 获取用户总数 |
| POST   | /api/users       | 新加用户 |
| DELETE | /api/users/:port | 通过端口号删除用户 |

*GET /api/users*

```

```

*GET /api/users/count*

```
```

*POST /api/users*

```
```