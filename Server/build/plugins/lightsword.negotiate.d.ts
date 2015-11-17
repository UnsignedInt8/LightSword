import { INegotitationOptions } from './main';
export declare function negotiate(options: INegotitationOptions): {
    result: boolean;
    reason?: string;
    cipherKey?: string;
    okNum?: number;
};
