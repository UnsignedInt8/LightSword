import * as crypto from 'crypto';
export declare function createCipher(algorithm: string, password: string): {
    cipher: crypto.Cipher;
    iv: Buffer;
};
