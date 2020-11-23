import { SocketType } from './components/types';
import { Context, Commands } from '@vaadin/router';
import { MessagesOverlay } from './overlays/messages';
import { DropsOverlay } from './overlays/drops';
import { WeatherOverlay } from './overlays/weather';
import './overlays/not-found';

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
      component.webServiceUrl = 'http://localhost:5000/twitchHub';
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
      component.webServiceUrl = 'http://localhost:5000/twitchHub';
      return component;
    },
  },
  {
    path: 'weather',
    action: async (ctx: Context, cmd: Commands) => {
      await import('./overlays/weather');
      let component = cmd.component('v10s-weather-overlay') as unknown as WeatherOverlay;
      return component;
    },
  },
  {
    path: '(.*)',
    component: 'not-found',
  }
];
