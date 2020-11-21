import { LitElement, html, property, customElement } from 'lit-element';
import '../components/messages/ChatMessages';
import { SocketType } from '../components/types';

@customElement('v10s-messages-overlay')
export class MessagesOverlay extends LitElement {
  
  @property({type: Number})
  messageTimeout: number = 20000;

  @property({type: Number})
  maxMessages: number = 10;

  @property({type: String})
  webServiceUrl: string = "http://localhost:5000/twitchHub";

  @property({type: String})
  webServiceType: SocketType = SocketType.signalR;

  render() {
    return html`
        <chat-messages maxMessages="${this.maxMessages}" messageTimeout="${this.messageTimeout}" webServiceUrl="${this.webServiceUrl}" webServiceType="${this.webServiceType}"></chat-messages>
   `;
  }
}
