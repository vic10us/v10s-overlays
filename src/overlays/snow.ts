import { LitElement, html, property, customElement } from 'lit-element';
import '../components/snow/snow';

@customElement('v10s-snow-overlay')
export class SnowOverlay extends LitElement {
  
  @property({type: String})
  webServiceUrl: string = "http://localhost:5000/twitchHub";

  render() {
    return html`
        <v10s-snow webServiceUrl="${this.webServiceUrl}"></v10s-snow>
   `;
  }
}
