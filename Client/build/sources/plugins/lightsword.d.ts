import * as net from 'net';
import { ISocks5Options } from '../socks5/plugin';
/**
 * LightSword Negotiation Algorithm
 */
export declare function negotiateAsync(socket: net.Socket, options: ISocks5Options): Promise<{
    success: boolean;
    reason?: string;
    cipherKey?: string;
    vNum?: number;
}>;
