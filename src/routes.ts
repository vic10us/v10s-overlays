import { SocketType } from './components/types';
import { Context, Commands } from '@vaadin/router';
import { MessagesOverlay } from './overlays/messages';
import { DropsOverlay } from './overlays/drops';
import { SnowOverlay } from './overlays/snow';
import './overlays/not-found';
import { RainOverlay } from './overlays/rain';
import { ConfigManager, Environment } from './environment';

var config = new Environment();

export const routes = [
  {
    path: '',
    component: 'v10s-overlays',
  },
  {
    path: 'drops',
    action: async (ctx: Context, cmd: Commands) => {
      await import('./overlays/drops');
      let component = cmd.component('v10s-drops-overlay') as unknown as DropsOverlay;
      component.webServiceType = SocketType.signalR;
      component.webServiceUrl = await config.socketUrl(); // 'http://localhost:5000/twitchHub';
      return component;
    },
  },
  {
    path: 'messages',
    action: async (ctx: Context, cmd: Commands) => {
      await import('./overlays/messages');
      let component = cmd.component('v10s-messages-overlay') as unknown as MessagesOverlay;
      console.log(component);
      component.webServiceType = SocketType.signalR;
      component.webServiceUrl = await config.socketUrl(); // 'http://localhost:5000/twitchHub';
      return component;
    },
  },
  {
    path: 'snow',
    action: async (ctx: Context, cmd: Commands) => {
      await import('./overlays/snow');
      let component = cmd.component('v10s-snow-overlay') as unknown as SnowOverlay;
      component.webServiceUrl = await config.socketUrl(); // 'http://localhost:5000/twitchHub';
      return component;
    },
  },
  {
    path: 'rain',
    action: async (ctx: Context, cmd: Commands) => {
      await import('./overlays/rain');
      let component = cmd.component('v10s-rain-overlay') as unknown as RainOverlay;
      component.webServiceType = SocketType.signalR;
      component.webServiceUrl = await config.socketUrl(); // 'http://localhost:5000/twitchHub';
      return component;
    },
  },
  {
    path: '(.*)',
    component: 'not-found',
  }
];
