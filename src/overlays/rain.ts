import { LitElement, html, property, customElement, css } from 'lit-element';
import {
    AmbientLight,
    BoxBufferGeometry,
    Clock,
    Color,
    Fog,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    SphereBufferGeometry,
    SpotLight,
    WebGLRenderer
} from 'three';
import Sockets from '../components/sockets';
import SignalRSocket from '../components/sockets/signalr';
import WebSocketSocket from '../components/sockets/websockets';
import { BackendEvents, SocketType } from '../components/types';
import { style } from './rain.css';

class WeatherElement {
    mesh: Mesh | undefined;
    velocity: number = 0.5;
    opacity: number = 1.0;
    timeToDie: number = 1000;
    dead: boolean = false;
    clock: Clock = new Clock();
};

@customElement('v10s-rain-overlay')
export class RainOverlay extends LitElement {

    @property({ type: String })
    webServiceUrl: string = "http://localhost:5000/twitchHub";

    @property({ type: String })
    webServiceType: SocketType = SocketType.signalR;

    socket!: SignalRSocket | WebSocketSocket;

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
    minY: number = 30;
    minX: number = 30;

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

    connectedCallback() {
        super.connectedCallback();
        let sockets = new Sockets({
            reconnect: true,
            socketType: this.webServiceType,
            reconnectTimeout: 1000,
            uri: this.webServiceUrl
        });

        this.socket = sockets.client;

        this.socket.on(BackendEvents.message, async (event: any) => {
            this.spawnBoxes(500);
        });
    }

    initScene = () => {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container3d.appendChild(this.renderer.domElement);

        const light = new AmbientLight(0x666666);
        this.scene.add(light);

        const spotLight = new SpotLight(0xffffff);
        spotLight.distance = 1000;
        spotLight.position.set(this.visibleWidthAtZDepth(0, this.camera) / 2, this.visibleHeightAtZDepth(0, this.camera), 50);
        spotLight.castShadow = true;
        this.scene.add(spotLight);

        this.box = new Mesh(
            new BoxBufferGeometry(20, 20, 20, 20, 20),
            new MeshStandardMaterial({
                color: 0xffffff,
                wireframe: false
            })
        );

        this.box.name = 'box';
        // this.scene.add(this.box);

        const sphere = new Mesh(
            new SphereBufferGeometry(15, 15, 15),
            new MeshStandardMaterial({
                color: 0x1c1cff,
                wireframe: false,
                opacity: 0.8,
                transparent: true
            })
        );
        sphere.name = 'sphere';

        // this.scene.add(sphere);

        this.renderFrame(0);
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

    renderFrame = (e: number) => {
        // if (this.box!.position.z > this.maxZ || this.box!.position.z < this.minZ) this.incrementZ *= -1;
        // this.box!.rotation.x += 0.05;
        // this.box!.rotation.y += 0.05;
        // this.box!.rotation.z += 0.05;
        // this.box!.position.z += this.incrementZ;
        // const sphere = this.scene.getObjectByName('sphere');
        // if (sphere !== null && sphere !== undefined) sphere.rotation.y += 0.01;
        this.updateRainElements(e);
        this.renderer.render(this.scene, this.camera!);
        requestAnimationFrame((e) => this.renderFrame(e));
    }

    updateRainElements = (e: number) => {
        this.rainElements.forEach((e, i) => {
            if (e.mesh === undefined) return;
            if (e.mesh.position.y <= -this.minY) {
                if (e.clock.getElapsedTime() * 1000 >= e.timeToDie) {
                    e.opacity -= 0.005;
                }
                e.dead = e.opacity <= 0;
                (e.mesh.material as MeshBasicMaterial).opacity = e.opacity;
                if (e.dead) {
                    console.log("removing");
                    this.scene.remove(e.mesh);
                    this.rainElements.splice(i, 1);
                    console.log(this.rainElements.length);
                }
                return;
            }
            e.mesh.position.y -= e.velocity;
        });
    }

    static styles = style();
    rainElements: WeatherElement[] = [];

    _handleClick = () => {
        console.log('Clicked ME!');
        this.spawnBoxes(10);
    }

    visibleHeightAtZDepth = (depth: number, camera: PerspectiveCamera) => {
        // compensate for cameras not positioned at z=0
        const cameraOffset = camera.position.z;
        if (depth < cameraOffset) depth -= cameraOffset;
        else depth += cameraOffset;

        // vertical fov in radians
        const vFOV = camera.fov * Math.PI / 180;

        // Math.abs to ensure the result is always positive
        return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
    }

    visibleWidthAtZDepth = (depth: number, camera: PerspectiveCamera) => {
        const height = this.visibleHeightAtZDepth(depth, camera);
        return height * camera.aspect;
    }

    spawnBoxes = (count: number) => {
        let newBoxes: WeatherElement[] = [];
        const color = new Color(0xff0000);
        color.offsetHSL(Math.random(), 0, 0);
        for (let i = 0; i < count; i++) {
            let we = this.spawnBox(color);
            newBoxes.push(we);
            if (we.mesh === null || we.mesh === undefined) return;
            this.rainElements.push(we);
        }
        this.rainElements.push(...newBoxes);
        var sceneObjects = newBoxes.map((nb) => {
            return nb.mesh!;
        });
        this.scene.add(...sceneObjects);
    }

    randomBetween = (min: number, max: number) : number => { // min and max included 
        return Math.random() * (max - min + 1) + min;
    }

    spawnBox = (color: Color = new Color(0xff0000)): WeatherElement => {
        const we = new WeatherElement();

        const dia = this.randomBetween(0.2, 3);

        const newBox = new Mesh(
            new SphereBufferGeometry(dia, 15, 15),
            new MeshStandardMaterial({
                color: color,
                wireframe: false,
                transparent: true,
                opacity: we.opacity,
            }),
        );

        newBox.position.y = this.randomBetween(this.minY, this.minY + 10);
        newBox.position.z = this.randomBetween(-15, 5);
        const w = this.visibleWidthAtZDepth(newBox.position.z, this.camera) / 2;
        newBox.position.x = this.randomBetween(-w, w);

        we.mesh = newBox;
        we.timeToDie = 5000;
        we.velocity = this.randomBetween(0.05, 1.0);
        return we;
    }

    render = () => {
        return html`
            <!-- <div><button @click="${this._handleClick}">Click Me</button></div> -->
            <div id="context"></div>
        `;
    }
}
