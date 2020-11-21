import { emotes } from "./emotes";

export default class {
  static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getCommandFromMessage = (message: string) => message.split(" ")[0];
  static getRestOfMessage = (message: string) => message.split(" ").slice(1);

  static getBroadcasterEmotes(size: string): string[] {
    return emotes.groups.broadcaster.map(
      (emoteId: string) => `${emotes.config.baseUrl}${emoteId}/${size}`
    );
  }

  static getRandomSizedBroadcasterEmotes(): string[] {
    return emotes.groups.broadcaster.map(
      (emoteId: string) =>
        `${emotes.config.baseUrl}${emoteId}/${
          emotes.config.sizes[this.getRandomInt(0, 2)]
        }`
    );
  }

  static getSpecialUserEmotes(username: string): string[] {
    return emotes.groups[username].map(
      (emoteId: string) =>
        `${emotes.config.baseUrl}${emoteId}/${
          emotes.config.sizes[this.getRandomInt(0, 2)]
        }`
    );
  }
}
