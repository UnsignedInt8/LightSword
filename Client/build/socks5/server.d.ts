export declare class Server {
    addr: string;
    port: number;
    password: string;
    cipherAlgoirthm: string;
    remoteAddr: string;
    remotePort: number;
    timeout: number;
    socks5Username: string;
    socks5Password: string;
    private _server;
    private static SupportedNegotiatonMethods;
    private static SupportedVersions;
    start(): boolean;
    stop(): boolean;
    private handleHandshake(data);
    private handleAuthentication(data);
    private refineRequest(data);
}
