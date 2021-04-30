import { LitElement, html, css, customElement } from 'lit-element';

@customElement('v10s-overlays')
export class App extends LitElement {

  static styles = css`
    :host {
      min-height: 100vh;
      margin: 0 auto;
    }

    main {
      flex-grow: 1;
    }
  `;

  render() {
    const hellostr = 'This is a test';
    return html`
      <main>
        ${hellostr}
        <slot></slot>
      </main>
  `;
  }
}
