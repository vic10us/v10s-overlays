import { LitElement, html, css, property, customElement } from 'lit-element';

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
    return html`
      <main>
        This is a test
        <slot></slot>
      </main>
  `;
  }
}
