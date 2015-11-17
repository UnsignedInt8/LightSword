import { ISocks5, ISocks5Options } from './main';
export declare class LightSwordConnect implements ISocks5 {
    cipherKey: string;
    vNum: number;
    digest: string;
    negotiate(options: ISocks5Options, callback: (success: boolean, reason?: string) => void): void;
    transport(options: ISocks5Options): void;
}
