import { LitElement, html, customElement, property } from 'lit-element';
import p5 from "p5";
import { Sketch } from "./Sketch";

@customElement('v10s-drops')
export class Drops extends LitElement {

    @property({type: String}) socketType = 'SignalR';
    @property({type: String}) socketUri = 'http://localhost:5000/twitchHub';

    connectedCallback() {
        super.connectedCallback();
        new p5(p5 => Sketch(p5, this.socketUri, this.socketType))
    }

    render() {
        return html``;
    }

}
