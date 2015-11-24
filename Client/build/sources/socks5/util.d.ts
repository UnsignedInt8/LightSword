export declare function lookupHostIPAsync(): Promise<string>;
export declare function buildDefaultSocks5ReplyAsync(): Promise<Buffer>;
export declare function refineATYP(rawData: Buffer): {
    addr: string;
    port: number;
    addrByteLength: number;
    headerLength: number;
};
