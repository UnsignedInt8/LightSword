import { ISocks5Options } from './main';
export declare function negotiateAsync(options: ISocks5Options): {
    success: boolean;
    reason?: string;
    cipherKey?: string;
    okNum?: number;
    digest?: string;
};
