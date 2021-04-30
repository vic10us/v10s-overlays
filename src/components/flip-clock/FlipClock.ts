import { customElement, LitElement } from "lit-element";
import { style } from "./FlipClock.css";
import { content } from "./FlipClock.html";

@customElement('flip-clock')
export class FlipClock extends LitElement {
    static styles = style();

    render() {
        return content(this);
    }
}