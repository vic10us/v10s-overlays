import { LitElement, html, customElement } from 'lit-element';

@customElement('not-found')
export class NotFound extends LitElement {

  render() {
    return html`
        <div>Page not found</div>
    `;
  }

}
