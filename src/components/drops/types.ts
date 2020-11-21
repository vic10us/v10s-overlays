import P5 from "p5";
import { Validator } from "@ryannhg/safe-json";

interface Emotes {
  config: {
    baseUrl: string;
    sizes: string[];
  };
  groups: {
    [key: string]: string[];
  };
}

interface IVelocity {
  min: number;
  max: number;
}

interface IDrop {
  p5: P5;
  image: P5.Image;
  landed: boolean;
  wobble: number;
  position: P5.Vector;
  landTime: number;
}

interface IDropConfig {
  emoteMultiplier: number;
  velocities: IVelocity;
  strategy: string;
  size?: string;
}

interface IConfig {
  maxVisibleDrops: number;
  test: boolean;
  dropTimeout: number;
  drops: {
    [key: string]: IDropConfig;
  };
}

interface IStrategies {
  [key: string]: (dropConfig: IDropConfig) => void;
}

type Fields<T> = {
  [K in keyof T]: Validator<T[K]>;
};

type SocketEvent<T> = {
  data: T;
};

export enum MainframeEvents {
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
}

interface ISocketOptions {
  reconnect: boolean;
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

export type {
  IVelocity,
  IDrop,
  IDropConfig,
  IConfig,
  IStrategies,
  ISocketOptions,
  Emotes,
  Fields,
  SocketEvent,
  Callback,
  TrustedEventMap,
  TrustedEvent,
};
