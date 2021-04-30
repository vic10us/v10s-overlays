import { Validator } from '@ryannhg/safe-json';

type Fields<T> = {
  [K in keyof T]: Validator<T[K]>;
};

type SocketEvent<T> = {
  data: T;
};

export enum BackendEvents {
  sub = "sub",
  dropuser = "dropuser",
  dropemotes = "dropemotes",
  weather = "weather",
  raid = "raid",
  cheer = "cheer",
  specialuserjoin = "specialuserjoin",
  settrailing = "settrailing",
  teammemberjoin = "teammemberjoin",
  yeetuser = "yeetuser",
  message = "message",
}

export enum SocketType {
  simple = "simple",
  signalR = "signalR"
}

interface ISocketOptions {
  uri: string;
  socketType: SocketType;
  reconnect: boolean;
  reconnectTimeout: number;
}

type Callback = (data: unknown) => void;

type TrustedEventMap = {
  raw: Set<Callback>;
  open: Set<Callback>;
  close: Set<Callback>;
  error: Set<Callback>;
  sub: Set<Callback>;
  join: Set<Callback>;
  message: Set<Callback>;
  dropuser: Set<Callback>;
  dropemotes: Set<Callback>;
  weather: Set<Callback>;
  raid: Set<Callback>;
  cheer: Set<Callback>;
  specialuserjoin: Set<Callback>;
  settrailing: Set<Callback>;
  teammemberjoin: Set<Callback>;
  yeetuser: Set<Callback>;
};

type TrustedEvent = keyof TrustedEventMap;

type DropParams = {
  username: string,
  url: string,
  isAvatar: boolean
};

export type {
  ISocketOptions,
  SocketEvent,
  Fields,
  Callback,
  TrustedEventMap,
  TrustedEvent,
  DropParams
};