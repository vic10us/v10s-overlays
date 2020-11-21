import {
  ISocketOptions,
  Callback,
  TrustedEventMap,
  TrustedEvent,
} from "../types";

import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export default class SignalRSocket {
  isSecure: boolean;
  reconn: boolean;
  connected: boolean;
  methods: TrustedEventMap;
  connection!: HubConnection;
  socketOptions: ISocketOptions;

  constructor(private opts: ISocketOptions) {
    this.isSecure = /^(wss:\/\/)/.test(this.opts.uri) || /^(https:\/\/)/.test(this.opts.uri);
    this.reconn = this.opts.reconnect !== undefined ? this.opts.reconnect : true;
    this.socketOptions = opts;

    this.connected = false;

    this.createConnection();

    this.methods = {
      raw: new Set(),
      open: new Set(),
      close: new Set(),
      error: new Set(),
      sub: new Set(),
      join: new Set(),
      message: new Set(),
      dropuser: new Set(),
      dropemotes: new Set(),
      weather: new Set(),
      raid: new Set(),
      cheer: new Set(),
      specialuserjoin: new Set(),
      settrailing: new Set(),
      teammemberjoin: new Set(),
      yeetuser: new Set(),
    };
  }

  createConnection() {
    this.connection = new HubConnectionBuilder()
      .withUrl(this.socketOptions.uri)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => {
          if (!this.socketOptions?.reconnect) return null;
          return this.socketOptions?.reconnectTimeout ?? 1000;
        }
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on('ReceiveMessage', (user, message, data) => this.parseIncoming({ user, message, data }));
    this.connection.on('ReceiveChatMessage', (data, user) => this.parseIncoming({ user, message: "message", data }));

    this.connection
      .start()
      .then(() => this.triggerConnect())
      .catch((err) => this.triggerError(err));
  }

  triggerError(err: any) {
    console.error(err.toString());
  }

  triggerConnect() {
    console.log('Hub Connection Connected');
  }

  parseIncoming(event: any) {
    console.log(event);
    let evt: TrustedEvent = "raw";

    evt = event.message.toLowerCase();

    let callbacks = this.methods[evt];

    if (!callbacks) callbacks = this.methods.raw;

    callbacks.forEach((func) => {
      func(event);
    });
  }

  on(event: TrustedEvent, callback: Callback) {
    this.methods[event].add(callback);
    return;
  }

  disconnect() {
    this.connection.stop();
  }
}
