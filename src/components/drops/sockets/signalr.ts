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
    connection: HubConnection;
    connectionUri: string;
    
    constructor(private uri: string, private opts: ISocketOptions) {
      this.isSecure = /^(wss:\/\/)/.test(uri) || /^(https:\/\/)/.test(uri);
      this.reconn = opts.reconnect !== undefined ? opts.reconnect : true;
  
      this.connected = false;
      this.connectionUri = uri;
  
      this.connection = new  HubConnectionBuilder()
        .withUrl(this.connectionUri)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: () => {
            return 1000;
          }
        })
        .configureLogging(LogLevel.Information)
        .build();
  
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
      this.connection.on('ReceiveMessage', (user, message, data) =>  this.parseIncoming({ user, message, data }));
  
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
    }
  }
  