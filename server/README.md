# LightSword 服务器端

LightSword 服务器基于 Node.js 4.0+。支持 SOCKS5 代理，多用户支持，HTTP 管理。从 0.7.0 开始支持 Level.4 客户端。

运行参数
---

| 参数 | 完整参数       | 解释 |
|------|--------------|------|
| -p   | --port       | 监听端口 |
| -k   | --password   | 密码 |
| -m   | --method     | 加密算法（参见客户端）|
| -c   | --config     | 配置文件路径 |
| -t   | --timeout    | 超时时长（单位:秒）|
| -f   | --fork       | 作为守护进程运行（不支持 Windows）|
| -u   | --users      | 多用户配置文件路径 |
| -d   | --daemon     | 守护进程控制命令，支持: stop, restart, status |
| -r   | --cluster    | 以集群（多进程）模式运行 |
| -a   | --management | 启用HTTP管理 |
| -s   | --speed      | 启用网速限制（单位: KB/s）|

注意：

网速限制仅针对单个TCP连接限速，目前无法针对全局限速。因此对网页浏览等限速效果不明显，对文件下载、观看视频等效果较好。

支持加密算法:
---

| 算法 |
|----------|
|aes-128-cfb|
|aes-128-ofb|
|aes-192-cfb|
|aes-192-ofb|
|aes-256-cfb|
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

配置文件是使用 utf-8 编码的 JSON 格式文件，配置字段和命令行完整参数相同。

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

多用户支持:
---

使用 -u (--users) 参数指定多用户配置文件路径，配置文件请参见 ../misc/users.conf 文件提供的示例。

其中，每个用户对应一个端口号，因此端口号不可以重复，如有重复，则选择最开始的一个。

配置文件为 utf-8 编码的文本文件，格式如下:

```
＃ 注释行 <必填项> [可选项］
＃ <Port-Number> <Password> <Cipher-Algorithm> [ISO-8601-Extended-Date-Format-String]

25000 abc123 aes-256-cfb
25001 abc123 aes-256-cfb 2016-01-04T03:01:54+09:00

#注意: 字段之间用半角空格分割，字段中不允许出现空格

------------------------------
> lsserver --users ./users.txt

```

HTTP 管理
---

从 0.5.0 版本开始，LightSword 加入 HTTP 管理功能，为多用户管理带来方便。LightSword 采用 HTTP 协议，并通过 RESTful 风格交互，数据传输格式为 JSON 。

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
|--------|-----------------------------|---------------|
| GET    | /api/users                  | 获取所有用户信息 |
| GET    | /api/users/count            | 获取有效用户总数 |
| POST   | /api/users                  | 新加用户 |
| PUT    | /api/users/:port            | 更新用户服务器配置 |
| DELETE | /api/users/:port            | 删除用户 |
| GET    | /api/blacklist              | 获取黑名单IP |
| GET    | /api/blacklist/count        | 获取黑名单IP总数 |
| GET    | /api/blacklist/:port        | 获取指定端口号所对应的黑名单IP |
| GET    | /api/blacklist/:port/count  | 获取指定端口号所对应的黑名单IP总数 |

**GET /api/users 返回用户列表（数组）**

| 字段 | 解释 |
|-----|------|
| port | 端口号 |
| cipherAlgorithm | 加密算法 |
| expireDate | 过期日期 |

返回:

```
[{"port":25000,"cipherAlgorithm":"aes-256-cfb"},{"port":25001,"cipherAlgorithm":"bf-cfb","expireDate":"2017-01-04T03:01:54+09:00"}]
```

**GET /api/users/count 返回用户数**

| 字段 | 解释 |
|-----|------|
| count | 用户数 |

返回:

```
{"count":2}
```

**POST /api/users 新增用户**

| 字段 | 解释 |
|-----|------|
| port | 端口号（必填）|
| cipherAlgorithm | 加密算法（可选，默认: aes-256-cfb） |
| password | 密码（必填） |
| timeout | 超时（单位: 秒，可选，默认: 10秒） |
| expireDate | 过期日期（ISO8601扩展日期格式，可选，默认: 空，表示永不过期） |
| disableSelfProtection | 禁用黑名单机制（布尔值，可选，默认: false） |

支持 POST JSON 数组，同时创建多用户

返回:

| 字段 | 解释 |
|-----|------|
| success | true 成功，false 失败 |
| msg | 失败原因 |

```
POST application/json

{
  "cipherAlgorithm": "aes-256-cfb",
  "port": 28000,
  "password": "abc123",
  "timeout": 30,
  "expireDate": "2017-01-04T03:01:54+09:00",
  "disableSelfProtection": true
}

Succeed =>

{
  "success": true
}

Failed =>

{
  "success": false,
  "msg": "Port Number: 28000 is used or access denied"
}

```

**PUT /api/users/:port 更新用户服务器配置**

| 字段 | 解释 |
|-----|------|
| expireDate | 过期日期（ISO8601扩展日期格式，如果不填写该参数，则取消时间限制） |
| disableSelfProtection | 是否禁用黑名单机制（布尔值，可选） |

返回:

同上

```
POST application/json

{
  "expireDate": "2015-01-04T03:01:54+09:00",
  "disableSelfProtection": true
}

Succeed =>

{
  "success": true
}

Failed =>

{
  "success": false,
  "msg": "User Not Found"
}

```

**DELETE /api/users/:port 删除用户**

通过使用 DELETE 方法，删除已存在用户。

返回:

同上

```

Succeed =>

{
  "success": true
}

Failed =>

{
  "success": false,
  "msg": "User Not Found"
}

```

**GET /api/blacklist 获取黑名单IP列表**

返回IP地址（IPv4, IPv6）字符串数组

黑名单列表，仅保存最近24小时的IP地址

```
=> ["::ffff:127.0.0.1","::1"]
```

**GET /api/blacklist/count 获取黑名单IP总数**

| 字段 | 解释 |
|-----|------|
| count | 黑名单IP总数 |

```
=> {"count":2}
```

**GET /api/blacklist/:port 获取指定端口号所对应的黑名单IP列表**

```
=> ["::ffff:127.0.0.1","::1"]
```

**GET /api/blacklist/:port 获取指定端口号所对应的黑名单IP总数**

| 字段 | 解释 |
|-----|------|
| count | 黑名单IP总数 |

```
=> {"count":2}
```