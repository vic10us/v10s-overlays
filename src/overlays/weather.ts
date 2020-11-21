import { LitElement, html, property, customElement } from 'lit-element';
import '../components/weather/Weather';

@customElement('v10s-weather-overlay')
export class WeatherOverlay extends LitElement {
  
  @property({type: String})
  webServiceUrl: string = "http://localhost:5000/twitchHub";

  render() {
    return html`
        <v10s-weather webServiceUrl="${this.webServiceUrl}"></v10s-weather>
   `;
  }
}
