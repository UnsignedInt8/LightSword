export declare enum AUTHENTICATION {
    NOAUTH = 0,
    GSSAPI = 1,
    USERPASS = 2,
    NONE = 255,
}
export declare enum REQUEST_CMD {
    CONNECT = 1,
    BIND = 2,
    UDP_ASSOCIATE = 3,
}
export declare enum ATYP {
    IPV4 = 1,
    DN = 3,
    IPV6 = 4,
}
export declare enum REPLY_CODE {
    SUCCESS = 0,
    SOCKS_SERVER_FAILURE = 1,
    CONNECTION_NOT_ALLOWED = 2,
    NETWORK_UNREACHABLE = 3,
    HOST_UNREACHABLE = 4,
    CONNECTION_REFUSED = 5,
    TTL_EXPIRED = 6,
    CMD_NOT_SUPPORTED = 7,
    ADDR_TYPE_NOT_SUPPORTED = 8,
}
export declare enum SOCKS_VER {
    V5 = 5,
    V4 = 4,
}
