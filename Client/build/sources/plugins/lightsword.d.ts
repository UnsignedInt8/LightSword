import { INegotiationOptions } from '../socks5/plugin';
/**
 * LightSword Negotiation Algorithm
 */
export declare function negotiateAsync(options: INegotiationOptions): Promise<{
    success: boolean;
    reason?: string;
    cipherKey?: string;
    vNum?: number;
}>;
