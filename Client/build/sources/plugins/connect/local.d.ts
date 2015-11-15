import { IConnectExecutor, INegotiationOptions, IConnectDestinationOptions, ITransportOptions } from '../../socks5/interfaces';
export declare class LocalConnectExecutor implements IConnectExecutor {
    negotiate(options: INegotiationOptions, callback: (result: boolean, reason?: string) => void): void;
    connectDestination(options: IConnectDestinationOptions, callback: (result: boolean, reason?: string) => void): void;
    transport(options: ITransportOptions, communicationEnd: () => void): void;
}
