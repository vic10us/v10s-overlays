//const smallCircle = new URL('./assets/white_circle.png', import.meta.url);
//const bigCircle = new URL('./assets/white_circle_big.png', import.meta.url);
import P5, { Image } from 'p5';
import Drop from './Drop';
import ImageManager from './ImageManager';
import { config } from './config';
import { emotes } from './emotes';
import utils from './utils';
import {
  IVelocity,
  IDrop,
  IDropConfig,
  IStrategies,
  Fields,
  SocketEvent,
  MainframeEvents,
} from "./types";
import { Expect, Validator } from "@ryannhg/safe-json";
import { Problem } from "@ryannhg/safe-json/dist/problem";
import SignalRSocket from "./sockets/signalr";
import WebSocketSocket from "./sockets/websockets";

const socketEvent = <T>(fields: Fields<T>): Validator<{ data: T }> => {
  return Expect.object({
    data: Expect.object(fields),
  });
};

const attempt = <T>(
  validator: Validator<T>,
  data: unknown,
  onPass: (value: T) => void
) =>
  validator.run(data, {
    onPass,
    onFail: (error) => console.error(Problem.toString(error)),
  });

const Sketch = (p5: P5, mainFrameUri: string, mainFrameType: string) => {
  let socket : SignalRSocket | WebSocketSocket;

  switch (mainFrameType) {
    case "SignalR":
      socket = new SignalRSocket(mainFrameUri, {
        reconnect: true,
      });
      break;
    case "WebSockets":
      socket = new WebSocketSocket(mainFrameUri, {
        reconnect: true,
      });
      break;
    default:
      throw new Error(`[${mainFrameType}] is not a recognized socket service type`);
  }

  let drops: IDrop[] = [];
  let dropQueue: IDrop[] = [];

  const imageManager = new ImageManager(p5);
  let trailing = false;

  const strategies: IStrategies = {
    dropRandomSizedBroadcasterEmotes: (dropConfig: IDropConfig) => {
      rain(
        utils.getRandomSizedBroadcasterEmotes(),
        dropConfig.emoteMultiplier,
        dropConfig.velocities
      );
    },
    dropSpecificSizedBroadcasterEmotes: (dropConfig: IDropConfig) => {
      rain(
        utils.getBroadcasterEmotes(dropConfig.size as string),
        dropConfig.emoteMultiplier,
        dropConfig.velocities
      );
    },
  };

  socket.on(MainframeEvents.sub, async (data) => {
    type SubEvent = SocketEvent<{ logoUrl: string }>;

    const validator: Validator<SubEvent> = socketEvent({
      logoUrl: Expect.string,
    });

    attempt(validator, data, (event) => {
      bigDropUser(event.data.logoUrl);
      rain(
        utils.getRandomSizedBroadcasterEmotes(),
        config.drops["!rain"].emoteMultiplier,
        config.drops["!rain"].velocities
      );
    });
  });

  socket.on(MainframeEvents.teammemberjoin, async (data) => {
    type DropUserEvent = SocketEvent<{ logoUrl: string }>;

    const validator: Validator<DropUserEvent> = socketEvent({
      logoUrl: Expect.string,
    });

    attempt(validator, data, (event) => {
      dropUser(event.data.logoUrl);
      eventRain(5);
    });
  });

  socket.on(MainframeEvents.yeetuser, async (data) => {
    type YeetUserEvent = SocketEvent<{ logoUrl: string }>;

    const validator: Validator<YeetUserEvent> = socketEvent({
      logoUrl: Expect.string,
    });

    attempt(validator, data, (event) => {
      yeetUser(event.data.logoUrl);
    });
  });

  socket.on(MainframeEvents.dropuser, async (data:any) => {
    type DropUserEvent = SocketEvent<{ profile_image_url: string }>;

    const validator: Validator<DropUserEvent> = socketEvent({
      profile_image_url: Expect.string,
    });

    attempt(validator, data, (event) => {
      console.log('Calling dropUser');
      dropUser(event.data.profile_image_url);
    });
  });

  socket.on(MainframeEvents.dropemotes, async (data) => {
    type DropEmotesEvent = SocketEvent<{
      dropType: string;
      emoteUrls: string[];
    }>;

    const validator: Validator<DropEmotesEvent> = socketEvent({
      dropType: Expect.string,
      emoteUrls: Expect.array(Expect.string),
    });

    attempt(validator, data, (event) => {
      const dropConfig = config.drops[event.data.dropType];
      if (dropConfig) {
        event.data.emoteUrls.forEach(async (emoteUrl: string) => {
          const image = await imageManager.getImage(emoteUrl);
          queueDrop(image, dropConfig.velocities, false);
        });
      }
    });
  });

  socket.on(MainframeEvents.weather, async (data) => {
    type WeatherEvent = SocketEvent<{ weatherEvent: string }>;

    const validator: Validator<WeatherEvent> = socketEvent({
      weatherEvent: Expect.string,
    });

    attempt(validator, data, (event) => {
      const dropConfig = config.drops[event.data.weatherEvent];
      if (dropConfig) {
        strategies[dropConfig.strategy](dropConfig);
      }
    });
  });

  socket.on(MainframeEvents.raid, async (data) => {
    type RaidEvent = SocketEvent<{ raiderCount: number }>;

    const validator: Validator<RaidEvent> = socketEvent({
      raiderCount: Expect.number,
    });

    attempt(validator, data, (event) => {
      eventRain(event.data.raiderCount);
    });
  });

  socket.on(MainframeEvents.cheer, async (data) => {
    type CheerEvent = SocketEvent<{ bitCount: string }>;

    const validator: Validator<CheerEvent> = socketEvent({
      bitCount: Expect.string,
    });

    attempt(validator, data, (event) => {
      const rawBits = parseInt(event.data.bitCount, 10);

      const dropBits =
        rawBits < config.maxVisibleDrops ? rawBits : config.maxVisibleDrops;

      eventRain(dropBits);
    });
  });

  socket.on(MainframeEvents.specialuserjoin, async (data) => {
    type SpecialUserJoinEvent = SocketEvent<{ username: string }>;

    const validator: Validator<SpecialUserJoinEvent> = socketEvent({
      username: Expect.string,
    });

    attempt(validator, data, (event) => {
      specialUserEvent(event.data.username);
    });
  });

  socket.on(MainframeEvents.settrailing, async (data) => {
    type SetTrailingEvent = SocketEvent<{ trailing: boolean }>;

    const validator: Validator<SetTrailingEvent> = socketEvent({
      trailing: Expect.boolean,
    });

    attempt(validator, data, (event) => {
      return (trailing = event.data.trailing);
    });
  });

  const queueDrop = (
    image: Image,
    velocity: IVelocity,
    fixedPosition: boolean
  ) => {
    if (drops.length <= config.maxVisibleDrops) {
      drops.push(new Drop(p5, image, velocity, fixedPosition));
    } else {
      dropQueue.push(new Drop(p5, image, velocity, fixedPosition));
    }
  };

  const rain = async (
    emotes: string[],
    emoteMultiplier: number,
    velocity: IVelocity
  ) => {
    const images = await Promise.all(
      emotes.map((url) => imageManager.getImage(url))
    );

    while (emoteMultiplier--) {
      images.map((image) => queueDrop(image, velocity, false));
    }
  };

  const eventRain = (emoteCount: number) => {
    const emotes = [];

    while (emoteCount--) {
      emotes.push(p5.random(utils.getRandomSizedBroadcasterEmotes()));
    }

    rain(emotes, 1, config.drops["!rain"].velocities);
  };

  const specialUserEvent = (username: string) => {
    rain(
      utils.getSpecialUserEmotes(username),
      5,
      config.drops["!rain"].velocities
    );
  };

  const bigDropUser = async (imgUrl: string) => {
    const image = await imageManager.getImage(imgUrl);
    const clip = await imageManager.getImage('./assets/white_circle_big.png');

    image.mask(clip);
    queueDrop(image, config.drops["!drop"].velocities, false);
  };

  const dropUser = async (imgUrl: string) => {
    console.log(imgUrl);
    const _image = imgUrl.replace("300x300", "50x50");
    const image = await imageManager.getImage(_image);
    const clip = await imageManager.getImage('./assets/white_circle.png');

    image.mask(clip);
    queueDrop(image, config.drops["!drop"].velocities, false);
  };

  const yeetUser = async (imgUrl: string) => {
    const _image = imgUrl.replace("300x300", "50x50");
    const image = await imageManager.getImage(_image);
    const clip = await imageManager.getImage('./assets/white_circle.png');

    image.mask(clip);
    queueDrop(image, config.drops["!yeet"].velocities, true);
  };

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D);

    if (config.test) {
      // not added to queue for testing
      const images = await Promise.all(
        utils
          .getBroadcasterEmotes(emotes.config.sizes[1])
          .map((url) => imageManager.getImage(url))
      );
      drops = Array.from({ length: 10 }).reduce((drops: any[]) => {
        return drops.concat(
          images.map(
            (image) =>
              new Drop(p5, image, config.drops["!rain"].velocities, false)
          )
        );
      }, []);
    }
  };

  p5.draw = () => {
    if (!trailing) p5.clear();
    const now = Date.now();
    drops = drops.filter((drop: any) => {
      drop.update();
      return !drop.draw(now);
    });
    if (drops.length <= config.maxVisibleDrops) {
      const end = config.maxVisibleDrops - drops.length;
      drops = drops.concat(dropQueue.slice(0, end));
      dropQueue = dropQueue.slice(end);
    }
  };
};

export { Sketch };
