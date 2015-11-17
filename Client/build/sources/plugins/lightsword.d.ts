import { IStreamBasicOptions } from './main';
/**
 * LightSword Negotiation Algorithm
 */
export declare function negotiate(options: IStreamBasicOptions): {
    result: boolean;
    reason?: string;
    cipherKey?: string;
    vNum?: number;
};
