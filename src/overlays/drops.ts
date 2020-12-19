import { LitElement, html, customElement, property } from 'lit-element';
import '../components/drop-game/drop-game';
import { SocketType } from '../components/types';

@customElement('v10s-drops-overlay')
export class DropsOverlay extends LitElement {

  @property({ type: String })
  webServiceUrl: string = "http://localhost:5000/twitchHub";
  
  @property({ type: String })
  webServiceType: SocketType = SocketType.signalR;
  
  render() {
    return html`
        <v10s-drop-game webServiceUrl="${this.webServiceUrl}" webServiceType="${this.webServiceType}"></v10s-drop-game>
   `;
  }

}
