import { LitElement, html, css, property, internalProperty, customElement } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { IChatMessage } from './models';

@customElement('chat-message')
export class ChatMessage extends LitElement {

  @property()
  message : IChatMessage | undefined = undefined;

  @property({type: Number})
  timeout: number = 5000;

  @internalProperty()
  expiring: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      console.debug('Message is expiring');
      if (this.message) this.expiring = true;
      this.requestUpdate();
      setTimeout(() => {
        // this.setAttribute('message.expired', 'true');
        if (this.message) this.message.expired = true;
        this.requestUpdate();
        console.debug('Message expired...');
      }, 2000);
    }, this.timeout);
    console.debug(`Added with a timeout of: [${this.timeout}]ms`);
  }

  processChat(event: IChatMessage) {
    let tempMessage: string = event?.message.replace(/<img/g, '<DEL') || '';
    const emotes: any[] = [];

    // If the message has emotes, modify message to include img tags to the emote
    if (event?.emotes) {
      let emoteSet: { emoteId: string; emoteImageTag: string; emoteUrl: string; start: number; end: number; }[] = [];

      for (const emote of Object.keys(event.emotes)) {
        const emoteLocations = event.emotes[emote];
        emoteLocations.forEach((location) => {
          emoteSet.push(this.generateEmote(emote, location));
        });
      }

      // Order the emotes descending so we can iterate
      // through them with indexes
      emoteSet.sort((a, b) => {
        return b.end - a.end;
      });

      emoteSet.forEach((emote) => {
        emotes.push(emote.emoteUrl);
        let emoteMessage = tempMessage.slice(0, emote.start);
        emoteMessage += emote.emoteImageTag;
        emoteMessage += tempMessage.slice(emote.end + 1, tempMessage.length);
        tempMessage = emoteMessage;
      });
    }
    
    tempMessage = tempMessage.replace(
      /@(\w*)/gm,
      `<span class="tag">$&</span>`
    );

    return {
      message: tempMessage,
      emotes: emotes.map((m) => m.emoteImageTag as string),
    };
  }

  generateEmote(emoteId: string, position: string) {
    const [start, end] = position.split('-').map(Number);
    //todo - if only emote - make 3.0
    return {
      emoteId,
      emoteImageTag: `<img class='emote' src='https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/1.0'/>`,
      emoteUrl: `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/1.0`,
      start,
      end,
    };
  }
  
  @internalProperty()
  get processedChat() {
      return this.processChat(this.message as IChatMessage);
  }

  static styles = css`
  :host {
    --top-border-size: 6px;
    text-align: left;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    margin: 0;
    font-weight: var(--font-weight-normal);
  }

  @keyframes slideIn {
    0% {
      transform: translateX(-400px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .event {
    animation: slideIn 0.2s ease-in-out;
    background-color: var(--black);
    display: flex;
    flex-direction: row;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    border-top: var(--top-border-size) solid;
    border-image-slice: 1;
    border-image-source: linear-gradient(
      90deg,
      var(--yellow) 0%,
      var(--yellow) 100%
    );
    box-shadow: 0rem 0.6rem 1rem -0.4rem var(--black);
    border-bottom-right-radius: 0.25rem;
    position: relative;
    overflow: hidden;
  }

  .event-subscriber:after {
    content: '';
    position: absolute;
    right: -4px;
    bottom: -13px;
    transform: rotate(45deg);
    border-top: 20px solid transparent;
    border-bottom: 20px solid transparent;
    border-left: 20px solid var(--yellow);
  }

  .event-broadcaster:after {
    content: '';
    position: absolute;
    right: -4px;
    bottom: -13px;
    transform: rotate(45deg);
    border-top: 20px solid transparent;
    border-bottom: 20px solid transparent;
    border-left: 20px solid transparent;
    border-image-source: linear-gradient(
      90deg,
      var(--vip) 0%,
      var(--blue-darker) 100%
    );
  }

  .event-vip {
    border-image-source: linear-gradient(
      90deg,
      var(--yellow) 0%,
      var(--vip) 100%
    );
  }

  .event-mod {
    border-image-source: linear-gradient(
      90deg,
      var(--yellow) 0%,
      var(--mod) 100%
    );
  }

  .event-broadcaster {
    background-color: var(--white);
    /* background: linear-gradient(0deg, var(--broadcaster), var(--black) 75%); */
    border-image-source: linear-gradient(
      90deg,
      var(--yellow) 0%,
      var(--broadcaster) 100%
    );
  }

  .displayName {
    color: var(--white);
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--yellow);
    font-weight: var(--font-weight-bold);
  }

  .displayName-vip {
    background: linear-gradient(-90deg, var(--yellow), var(--vip));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .displayName-mod {
    background: linear-gradient(-90deg, var(--yellow), var(--mod));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .displayName-broadcaster {
    background: linear-gradient(-90deg, var(--yellow), var(--broadcaster));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .message {
    color: var(--white);
    font-size: 1.4rem;
    display: inline-block;
    word-break: break-word;
    line-height: 1.6rem;
    font-weight: var(--font-weight-normal);
  }

  .message.broadcaster {
    color: var(--black);
    font-weight: bold;
  }

  .message-startsWithTag .tag:first-of-type {
    padding-left: 0;
  }

  .avatarContainer {
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    flex: 0 0 100px;
    background-position-y: 50%;
    background-color: var(--black);
  }

  .messageContainer {
    padding: 1rem;
    width: 100%;
  }

  .tag {
    color: var(--yellow);
    padding-left: 4px;
    padding-right: 4px;
  }

  .emote {
    display: inline-block;
    position: relative;
    top: 2px;
    margin-left: -4px;
    margin-right: -4px;
  }

/**
 * ----------------------------------------
 * animation slide-rotate-ver-left
 * ----------------------------------------
 */
@-webkit-keyframes slide-rotate-ver-left {
  0% {
    -webkit-transform: translateX(0) rotateY(0);
            transform: translateX(0) rotateY(0);
  }
  100% {
    -webkit-transform: translateX(-150px) rotateY(90deg);
            transform: translateX(-150px) rotateY(90deg);
  }
}
@keyframes slide-rotate-ver-left {
  0% {
    -webkit-transform: translateX(0) rotateY(0);
            transform: translateX(0) rotateY(0);
  }
  100% {
    -webkit-transform: translateX(-150px) rotateY(90deg);
            transform: translateX(-150px) rotateY(90deg);
  }
}

/**
 * ----------------------------------------
 * animation swing-out-bottom-bck
 * ----------------------------------------
 */
@-webkit-keyframes swing-out-bottom-bck {
  0% {
    -webkit-transform: rotateX(0);
            transform: rotateX(0);
    -webkit-transform-origin: bottom;
            transform-origin: bottom;
    opacity: 1;
  }
  100% {
    -webkit-transform: rotateX(100deg);
            transform: rotateX(100deg);
    -webkit-transform-origin: bottom;
            transform-origin: bottom;
    opacity: 0;
  }
}
@keyframes swing-out-bottom-bck {
  0% {
    -webkit-transform: rotateX(0);
            transform: rotateX(0);
    -webkit-transform-origin: bottom;
            transform-origin: bottom;
    opacity: 1;
  }
  100% {
    -webkit-transform: rotateX(100deg);
            transform: rotateX(100deg);
    -webkit-transform-origin: bottom;
            transform-origin: bottom;
    opacity: 0;
  }
}

/**
 * ----------------------------------------
 * animation swing-out-left-bck
 * ----------------------------------------
 */
@-webkit-keyframes swing-out-left-bck {
  0% {
    -webkit-transform: rotateY(0);
            transform: rotateY(0);
    -webkit-transform-origin: left;
            transform-origin: left;
    opacity: 1;
  }
  100% {
    -webkit-transform: rotateY(100deg);
            transform: rotateY(100deg);
    -webkit-transform-origin: left;
            transform-origin: left;
    opacity: 0;
  }
}
@keyframes swing-out-left-bck {
  0% {
    -webkit-transform: rotateY(0);
            transform: rotateY(0);
    -webkit-transform-origin: left;
            transform-origin: left;
    opacity: 1;
  }
  100% {
    -webkit-transform: rotateY(100deg);
            transform: rotateY(100deg);
    -webkit-transform-origin: left;
            transform-origin: left;
    opacity: 0;
  }
}

/**
 * ----------------------------------------
 * animation rotate-out-hor
 * ----------------------------------------
 */
@-webkit-keyframes rotate-out-hor {
  0% {
    -webkit-transform: rotateX(360deg);
            transform: rotateX(360deg);
    opacity: 1;
  }
  100% {
    -webkit-transform: rotateX(0deg);
            transform: rotateX(0deg);
    opacity: 0;
  }
}
@keyframes rotate-out-hor {
  0% {
    -webkit-transform: rotateX(360deg);
            transform: rotateX(360deg);
    opacity: 1;
  }
  100% {
    -webkit-transform: rotateX(0deg);
            transform: rotateX(0deg);
    opacity: 0;
  }
}

  .hideme {
    /* -webkit-animation: slide-rotate-ver-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: slide-rotate-ver-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;*/
    
    /*-webkit-animation: swing-out-bottom-bck 0.45s cubic-bezier(0.600, -0.280, 0.735, 0.045) both;
    animation: swing-out-bottom-bck 0.45s cubic-bezier(0.600, -0.280, 0.735, 0.045) both;*/
    
    -webkit-animation: swing-out-left-bck 1.45s cubic-bezier(0.600, -0.280, 0.735, 0.045) both;
    animation: swing-out-left-bck 1.45s cubic-bezier(0.600, -0.280, 0.735, 0.045) both;
    
    /*-webkit-animation: rotate-out-hor 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
    animation: rotate-out-hor 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;*/
  }
  `;

  getMainMessageClass = () => {
    let classList = 'event';
    if (this.expiring) classList += ' hideme';
    if (this.message?.userTypeList?.includes('vip')) classList += ' event-vip';
    if (this.message?.userTypeList?.includes('moderator')) classList += ' event-mod';
    if (this.message?.userTypeList?.includes('broadcaster')) classList += ' event-broadcaster';
    if (this.message?.userTypeList?.includes('subscriber')) classList += ' event-subscriber';
    return classList;
  }

  getDisplayNameClass = () => {
    let classList = 'displayName';
    if (this.message?.userTypeList?.includes('vip')) classList += ' displayName-vip';
    if (this.message?.userTypeList?.includes('moderator')) classList += ' displayName-mod';
    if (this.message?.userTypeList?.includes('broadcaster')) classList += ' displayName-broadcaster';
    if (this.message?.userTypeList?.includes('subscriber')) classList += ' displayName-subscriber';
    return classList;
  }

  getMessageClass = () => {
    let classList = 'message';
    if (this.processedChat.message.startsWith('<span class="tag">')) classList += ' message-startsWithTag';
    if (this.message?.userTypeList?.includes('vip')) classList += ' vip';
    if (this.message?.userTypeList?.includes('moderator')) classList += ' mod';
    if (this.message?.userTypeList?.includes('broadcaster')) classList += ' broadcaster';
    if (this.message?.userTypeList?.includes('subscriber')) classList += ' subscriber';
    return classList;
  }

  render() {
    return html`
        <div class="${this.getMainMessageClass()}">

            <div class="avatarContainer" style="background-image: url(${this.message?.logoUrl});"></div>

            <div class="messageContainer">
                <p class="${this.getDisplayNameClass()}">
                    @${this.message?.displayName}
                </p>
                
                <div class="${this.getMessageClass()}">
                    ${unsafeHTML(this.processedChat.message)}
                </div>
            </div>
        </div>
    `;
  }
}
