import { LitElement, html, property, customElement, css } from 'lit-element';
import { AmbientLight, BoxGeometry, Fog, Mesh, MeshBasicMaterial, PerspectiveCamera, Renderer, Scene, SphereGeometry, SpotLight, Vector3, WebGL1Renderer, WebGLRenderer } from 'three';
import { style } from './rain.css';

@customElement('v10s-rain-overlay')
export class RainOverlay extends LitElement {

    @property({ type: String })
    webServiceUrl: string = "http://localhost:5000/twitchHub";

    scene: Scene;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    box: Mesh | undefined;
    container3d!: HTMLElement;
    minZ: number = -900;
    maxZ: number = 50;
    incrementZ: number = 5;
    maxRange: number = 1000;
    minRange: number = this.maxRange / 2;

    constructor() {
        super();
        this.camera = new PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.z = 100;
        this.scene = new Scene();
        this.scene.fog = new Fog(0x000036, 0, this.minRange * 3);
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
          });
        this.scene.add(this.camera);
    }

    initScene = () => {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container3d.appendChild(this.renderer.domElement);
        
        const light = new AmbientLight(0x666666);
        this.scene.add(light);

        const spotLight = new SpotLight(0x666666);
        spotLight.distance = 2000;
        spotLight.position.set(-200, 700, 0);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        
        this.box = new Mesh(
            new BoxGeometry(20,20,20, 20, 20),
            new MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true
            })
        );

        this.box.name = 'box';
        this.scene.add(this.box);

        const sphere = new Mesh(
            new SphereGeometry(15,15,15),
            new MeshBasicMaterial({
                color: 0x1c1cff,
                wireframe: true
            })
        );
        sphere.name = 'sphere';

        this.scene.add(sphere);

        this.renderFrame();
    }

    firstUpdated = () => {
        this.container3d = this.shadowRoot!.getElementById('context')!;
        this.container3d.innerHTML = '';
        window.addEventListener('resize', this.onResize);
        this.initScene();
    }

    onResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.camera!.aspect = width / height;
        this.camera!.updateProjectionMatrix();
    }

    renderFrame = () => {
        if (this.box!.position.z > this.maxZ || this.box!.position.z < this.minZ) this.incrementZ *= -1;
        this.box!.rotation.x += 0.05;
        this.box!.rotation.y += 0.05;
        this.box!.rotation.z += 0.05;
        this.box!.position.z += this.incrementZ;
        const sphere = this.scene.getObjectByName('sphere');
        sphere!.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera!);
        requestAnimationFrame(this.renderFrame);
    }

    static styles = style();

    render = () => {
        return html`
            <div id="context"></div>
        `;
    }
}
