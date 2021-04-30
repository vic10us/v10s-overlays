import { emotes } from "./emotes";
import { IConfig } from "./types";

const config: IConfig = {
  maxVisibleDrops: 2048,
  test: false,
  dropTimeout: 10_000,
  drops: {
    "!yeet": {
      emoteMultiplier: 1,
      velocities: {
        min: 80,
        max: 100,
      },
      strategy: "yeet",
    },
    "!drop": {
      emoteMultiplier: 1,
      velocities: {
        min: 3,
        max: 7,
      },
      strategy: "drop",
    },
    "!bigdrop": {
      emoteMultiplier: 1,
      velocities: {
        min: 3,
        max: 7,
      },
      strategy: "drop",
    },
    "!rain": {
      emoteMultiplier: 256,
      velocities: {
        min: 20,
        max: 30,
      },
      strategy: "dropSpecificSizedBroadcasterEmotes",
      size: emotes.config.sizes[1],
    },
    "!blizzard": {
      emoteMultiplier: 256,
      velocities: {
        min: 20,
        max: 30,
      },
      strategy: "dropRandomSizedBroadcasterEmotes",
    },
    "!hail": {
      emoteMultiplier: 15,
      velocities: {
        min: 4,
        max: 10,
      },
      strategy: "dropRandomSizedBroadcasterEmotes",
    },
    "!shower": {
      emoteMultiplier: 5,
      velocities: {
        min: 2,
        max: 6,
      },
      strategy: "dropSpecificSizedBroadcasterEmotes",
      size: emotes.config.sizes[1],
    },
    "!snow": {
      emoteMultiplier: 10,
      velocities: {
        min: 1,
        max: 2,
      },
      strategy: "dropSpecificSizedBroadcasterEmotes",
      size: emotes.config.sizes[0],
    },
  },
};

export { config };
