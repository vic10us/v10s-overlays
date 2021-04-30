import { LitElement, html, css, property, customElement } from 'lit-element';
import { IChatMessage } from './models';
import { repeat } from 'lit-html/directives/repeat';
import './ChatMessage';
import Sockets from '../sockets/index';
import { BackendEvents, SocketType } from '../types';
import SignalRSocket from '../sockets/signalr';
import WebSocketSocket from '../sockets/websockets';

@customElement('chat-messages')
export class ChatMessages extends LitElement {

  @property({ type: Array })
  messages: IChatMessage[] = [];

  @property({ type: Number })
  maxMessages: number = 7;

  @property({ type: Number })
  messageTimeout: number = 20000;

  @property({ type: String })
  webServiceUrl: string = '';

  @property({ type: String })
  webServiceType: SocketType = SocketType.signalR;

  socket!: SignalRSocket | WebSocketSocket;

  connectedCallback() {
    super.connectedCallback();

    let sockets = new Sockets({
      reconnect: true,
      socketType: this.webServiceType,
      reconnectTimeout: 1000,
      uri: this.webServiceUrl
    });

    this.socket = sockets.client;

    this.socket.on(BackendEvents.message, async (event: any) => {
      console.log(`Message: `, event);
      let data = event.data as IChatMessage;
      const oldMessages = this.messages.filter((e) => {
        return !(e.expired === true);
      }).slice(
        Math.max(this.messages.length - this.maxMessages, 0)
      );
      var ne = {
        ...data,
        userTypeList: data.userTypes?.split(',').map((e) => e.trim().toLocaleLowerCase()),
      };
      this.setAttribute('messages', JSON.stringify([...oldMessages, ne]));
    });
  }

  messageList = (messages: IChatMessage[]) => html`
    ${repeat(messages, (message) => message.messageId, (message, index) => html`
      <chat-message .message="${message}" timeout="${this.messageTimeout}"></chat-message>
    `)}
  `;

  static styles = css`
    .messageQueue {
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      bottom: 0;
      width: 400px;
    }
  `;

  render() {
    return html`
      <div class="messageQueue">
        ${this.messageList(this.messages)}
      </div>
    `;
  }
}
