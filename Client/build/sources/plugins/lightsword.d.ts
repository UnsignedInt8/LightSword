import { INegotiationOptions } from './main';
export declare function negotiate(options: INegotiationOptions): {
    result: boolean;
    reason?: string;
    cipherKey?: string;
    vNum?: number;
};
