import { Router } from '@vaadin/router';
import './app';
import { routes } from './routes';

const outlet = document.getElementById('outlet');
export const router = new Router(outlet);
router.setRoutes(routes);