import { ISocketOptions, SocketType } from "../types";
import SignalRSocket from './signalr';
import WebSocketSocket from './websockets';

export default class Sockets {

    client: SignalRSocket | WebSocketSocket;

    constructor(options: ISocketOptions) {
        switch (options.socketType) {
            case SocketType.signalR:
                this.client = new SignalRSocket(options);
                break;
            case SocketType.simple:
                this.client = new WebSocketSocket(options.uri, options);
                break;
            default:
                throw new Error(`[${options.socketType}] is not a recognized socket service type`);
        }
    }
    
};