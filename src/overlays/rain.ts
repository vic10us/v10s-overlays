import { LitElement, html, property, customElement, css } from 'lit-element';
import {
    AmbientLight,
    Clock,
    Color,
    DirectionalLight,
    Fog,
    HemisphereLight,
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
    clock: Clock;
    scene: Scene;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
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
        //create clock for timing
        this.clock = new Clock();

        //create the scene
        this.scene = new Scene();
        this.scene.fog = new Fog(0x000036, 0, this.minRange * 3);

        //create camera
        this.camera = new PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.z = 100;

        //Add hemisphere light
        let hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 0.1 );
        hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
        hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
        hemiLight.position.set( 0, 50, 0 );
        this.scene.add( hemiLight );

        //Add directional light
        let dirLight = new DirectionalLight( 0xffffff , 0.5);
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set(this.visibleWidthAtZDepth(0, this.camera) / 2, this.visibleHeightAtZDepth(0, this.camera), 50);
        dirLight.position.multiplyScalar( 10000 );
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        let d = 50;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.camera.far = 13500;
        this.scene.add( dirLight );

        //Add ambient light
        const light = new AmbientLight(0x666666);
        this.scene.add(light);

        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });
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

        this.socket.on(BackendEvents.weather, async (event: any) => {
            this.spawnBoxes(500);
        });
    }

    initScene = () => {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        this.container3d.appendChild(this.renderer.domElement);
        
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
            <div id="context"></div>
        `;
    }
}
