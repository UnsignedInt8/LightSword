import { INegotiationOptions } from './main';
/**
 * LightSword Negotiation Algorithm
 */
export declare function negotiate(options: INegotiationOptions): {
    result: boolean;
    reason?: string;
    cipherKey?: string;
    vNum?: number;
};
