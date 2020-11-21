import { LitElement, html, customElement, property, css } from 'lit-element';
import Sockets from '../sockets';
import SignalRSocket from '../sockets/signalr';
import WebSocketSocket from '../sockets/websockets';
import { BackendEvents, DropParams, SocketType } from '../types';
import { content } from './drop-game.html';
import { style } from './drop-game.css';
import { DropInstance, GameScore, Truth } from './drop-proto';

@customElement('v10s-drop-game')
export class DropGame extends LitElement {

    @property({ type: String })
    webServiceUrl: string = "http://localhost:5000/twitchHub";

    @property({ type: String })
    webServiceType: SocketType = SocketType.signalR;

    socket!: SignalRSocket | WebSocketSocket;

    currentUsers: Truth = {};
    highScores: GameScore[] = [];
    drops: DropInstance[] = [];

    static styles = style();
    target!: HTMLElement;

    firstUpdated() {
        this.target = this.shadowRoot!.querySelector<HTMLElement>('.target')!;
        this.gameLoop();
    }

    connectedCallback() {
        super.connectedCallback();

        let sockets = new Sockets({
            reconnect: true,
            socketType: this.webServiceType,
            reconnectTimeout: 1000,
            uri: this.webServiceUrl
        });

        this.socket = sockets.client;

        this.socket.on(BackendEvents.dropuser, async (event: any) => {
            if (this.currentUsers[event.user]) return;

            const u = {
                profile_image_url: 'https://abs.twimg.com/emoji/v2/svg/1f603.svg',
                ...( event.data || {})
            };

            this.doDrop({
                username: event.user,
                url: u.profile_image_url,
                isAvatar: true
            });
        });
    }

    doDrop = (dropParams: DropParams) => {
        this.currentUsers[dropParams.username] = dropParams.username !== 'vic10usx';
        console.log('Doing drop', dropParams);
        let element = this.createDropElement(dropParams);
        let drop : DropInstance = new DropInstance();
        drop.username = dropParams.username;
        drop.element = element;
        drop.location = {
            x: window.innerWidth * Math.random(),
            y: -200
        };
        drop.velocity = {
            x: Math.random() * (Math.random() > 0.5 ? -1 : 1) * 10,
            y: 2 + Math.random() * 5
        };
        this.drops.push(drop);
        this.shadowRoot?.appendChild(element);
        this.updateDropPosition(drop);
    };

    updateDropPosition = (drop: DropInstance) => {
        if (drop.landed) return;
        drop!.element!.style.top = drop.getTop() + 'px';
        drop!.element!.style.left = drop.getLeft() + 'px';
    }

    createDropElement = (dropParams: DropParams) : HTMLDivElement => {
        const div = document.createElement('div');
        const parachute = 'images/parachute.png';//new URL('./images/parachute.png', import.meta.url).href;
        const seed = 'images/seed.png'; // new URL('./images/seed.png', import.meta.url).href;
        div.className = 'drop';
        div.innerHTML = `
      <h4 class="username">${dropParams.username}</h4>
      <img class="chute" src="${parachute}" alt="">
      <div class="user-image">
        <img class="${dropParams.isAvatar ? 'avatar' : ''}" src="${dropParams.url || seed}" />
      </div>`;
        return div;
    }

    render() {
        return content(this);
        // return html`<div>This is a test</div>`;
    }

    updateGame = () => {
        this.processCollisions();
        const targetHalfWidth = this.target.clientWidth / 2;
        this.drops.forEach(drop => {
            if (drop.landed) return;
    
            drop.location.x += drop.velocity.x;
            drop.location.y += drop.velocity.y;
    
            if (drop.getBottom() >= window.innerHeight) {
                drop.velocity.y = 0;
                drop.velocity.x = 0;
                drop.location.y = window.innerHeight - drop.element!.clientHeight;
                drop.landed = true;
                drop.element!.classList.add('landed');
                const {
                    x
                } = drop.location;
                const diff = window.innerWidth / 2 - x;
                const score = Math.abs(diff);
                if (score <= targetHalfWidth) {
                    const finalScore = (1 - (score / targetHalfWidth)) * 100;
                    this.highScores.push({
                        username: drop.username,
                        score: finalScore.toFixed(2)
                    });
                    // renderLeaderBoard();
                    this.addSeedling(x, finalScore, drop.username);
                    this.currentUsers[drop.username] = false;
                    drop.element!.classList.add('seedling-target');
                    //highScoreService.create({
                    //    username: drop.username,
                    //    score: +finalScore.toFixed(2),
                    //    platform: drop.platform,
                    //    eventId: liveChatId,
                    //});
                } else {
                    drop.element!.classList.add('no-target');
                }
                setTimeout(() => {
                    this.currentUsers[drop.username] = false;
                    this.shadowRoot?.removeChild(drop.element!);
                }, 30000);
                this.drops = this.drops.filter(d => d !== drop);
            }
        });
    }

    draw = () => {
        this.drops.forEach(this.updateDropPosition);
    }

    gameLoop = () => {
        this.updateGame();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    addSeedling = (x:number, score:number, username:string) => {
        const container = document.createElement('div');
        container.className = 'seedling-container initial';
        const name = document.createElement('h4');
        name.className = 'username seedling-target';
        name.style.fontSize = (score / 100) * 2.5 + 'rem';
        name.textContent = username;
        const seedling = document.createElement('img');
        seedling.className = 'seedling';
        seedling.src = 'images/snowman.png';
        seedling.style.height = (score * 1.5) + 'px';
        container.appendChild(name);
        container.appendChild(seedling);
        this.shadowRoot?.appendChild(container);
        container.style.left = x + 'px';
        container.style.top = (window.innerHeight - container.clientHeight) + 'px';
    }

    processCollisions() {
        for (let i = 0; i < this.drops.length; i++) {
            const drop = this.drops[i];
            for (let j = i + 1; j < this.drops.length; j++) {
                const drop2 = this.drops[j];
                this.processCollision(drop, drop2);
            }
            // Process collisions with the browser edges
            if (drop.getLeft() < 0) {
                drop.velocity.x = Math.abs(drop.velocity.x);
            }
            else if (drop.getRight() >= window.innerWidth) {
                drop.velocity.x = -Math.abs(drop.velocity.x);
            }
        }
    }

    processCollision = (drop:DropInstance, drop2:DropInstance) => {
        if (
            !this.checkAABBCollision(drop, drop2)
            || this.isMovingAway(drop, drop2)
        ) {
            return;
        }
        // TODO: Implement a proper 2D impulse exchange when the gravity is implemented.
        // Now it could result in one of the drops flying upwards forever after collision.
        // For now exchanging x velocity works good enough.
        const tmp = drop.velocity.x;
        drop.velocity.x = drop2.velocity.x;
        drop2.velocity.x = tmp;
    }

    checkAABBCollision(a:DropInstance, b:DropInstance) {
        const aIsToTheRightOfB = a.getLeft() > b.getRight();
        const aIsToTheLeftOfB = a.getRight() < b.getLeft();
        const aIsAboveB = a.getBottom() < b.getTop();
        const aIsBelowB = a.getTop() > b.getBottom();
        return !(
            aIsToTheRightOfB
            || aIsToTheLeftOfB
            || aIsAboveB
            || aIsBelowB
        );
    }

    isMovingAway = (drop:DropInstance, drop2:DropInstance) => {
        if (drop.getCenter().x < drop2.getCenter().x) {
            return drop.velocity.x < drop2.velocity.x;
        }
        else {
            return drop.velocity.x > drop2.velocity.x;
        }
    }

}
