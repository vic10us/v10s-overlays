import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { customElement, LitElement, property } from 'lit-element';
import { IChatMessage } from '../messages/models';
import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { content } from './snow.html';
import { style } from './snow.css';

@customElement('v10s-snow')
export class V10sSnow extends LitElement {

  @property({ type: String }) webServiceUrl!: string;
  threeCanvas!: HTMLElement;
  camera!: THREE.PerspectiveCamera;
  scene!: THREE.Scene;
  screenWidth: number = window.innerWidth;
  screenHeight: number = window.innerHeight;
  renderer!: THREE.WebGLRenderer;
  orbitControls: any;

  particleNum = 5000;
  maxRange = 1000;
  minRange = this.maxRange / 2;
  textureSize = 64.0;
  particles!: any;

  firstUpdated() {
    this.threeCanvas = this.shadowRoot!.getElementById('3d-canvas')!;
    //this.particleImage = new Image();
    //this.particleImage.src = 'http://i.imgur.com/cTALZ.png';
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000036, 0, this.minRange * 3);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, -100, 400);
    this.camera.lookAt(this.scene.position);

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.setClearColor(new THREE.Color(0x000036));
    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.renderer.shadowMap.enabled = true;

    /* AmbientLight
    -------------------------------------------------------------*/
    const ambientLight = new THREE.AmbientLight(0x666666);
    this.scene.add(ambientLight);

    /* SpotLight
    -------------------------------------------------------------*/
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.distance = 2000;
    spotLight.position.set(-200, 700, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    /* Snow Particles
    -------------------------------------------------------------*/
    const pointGeometry = new THREE.Geometry();
    for (let i = 0; i < this.particleNum; i++) {
      const x = Math.floor(Math.random() * this.maxRange - this.minRange);
      const y = Math.floor(Math.random() * this.maxRange - this.minRange);
      const z = Math.floor(Math.random() * this.maxRange - this.minRange);
      const particle = new THREE.Vector3(x, y, z);
      pointGeometry.vertices.push(particle);
      // const color = new THREE.Color(0xffffff);
      // pointGeometry.colors.push(color);
    }

    const pointMaterial = new THREE.PointsMaterial({
      size: 8,
      color: 0xffffff,
      vertexColors: false,
      map: this.getTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      // opacity: 0.8,
      fog: true,
      depthWrite: false
    });

    const velocities = [];
    for (let i = 0; i < this.particleNum; i++) {
      const x = Math.floor(Math.random() * 6 - 3) * 0.1;
      const y = Math.floor(Math.random() * 10 + 3) * - 0.05;
      const z = Math.floor(Math.random() * 6 - 3) * 0.1;
      const particle = new THREE.Vector3(x, y, z);
      velocities.push(particle);
    }

    this.particles = new THREE.Points(pointGeometry, pointMaterial);
    this.particles.geometry.velocities = velocities;
    this.scene.add(this.particles);

    /* resize
    -------------------------------------------------------------*/
    window.addEventListener('resize', this.onResize);

    /* rendering start
    -------------------------------------------------------------*/
    this.threeCanvas.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.renderFrame);
  }

  pause: boolean = false;

  fadeParticlesBy = () => {
    this.particles.material.opacity = 0;

  }

  renderFrame = (timeStamp: any) => {
    // this.orbitControls.update();

    // this.makeRoughGround(planeMesh);
    // console.log(timeStamp);
    const posArr = this.particles.geometry.vertices;
    const velArr = this.particles.geometry.velocities;

    posArr.forEach((vertex: { x: number; y: number; z: number; }, i: number) => {
      const velocity = velArr[i];

      //const x = i * 3;
      //const y = i * 3 + 1;
      //const z = i * 3 + 2;

      const velX = Math.sin(timeStamp * 0.001 * velocity.x) * 0.1;
      const velZ = Math.cos(timeStamp * 0.0015 * velocity.z) * 0.1;

      vertex.x += velX;
      vertex.y += velocity.y;
      vertex.z += velZ;

      if (vertex.y < -this.minRange) {
        vertex.y = this.minRange;
      }

    });

    this.particles.geometry.verticesNeedUpdate = true;

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.renderFrame);
  };

  onResize = () => {
    console.log('resized');
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  getTexture = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const diameter = this.textureSize;
    canvas.width = diameter;
    canvas.height = diameter;
    const canvasRadius = diameter / 2;

    /* gradation circle
    ------------------------ */
    this.drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height);

    /* snow crystal
    ------------------------ */
    // drawSnowCrystal(ctx, canvasRadius);

    const texture = new THREE.Texture(canvas);
    //texture.minFilter = THREE.NearestFilter;
    texture.type = THREE.FloatType;
    texture.needsUpdate = true;
    return texture;
  }

  drawRadialGradation(ctx: CanvasRenderingContext2D, canvasRadius: number, canvasW: number, canvasH: number) {
    ctx.save();
    const gradient = ctx.createRadialGradient(canvasRadius, canvasRadius, 0, canvasRadius, canvasRadius, canvasRadius);
    gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
    gradient.addColorStop(0.15, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  }

  connectedCallback() {
    super.connectedCallback();
    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(this.webServiceUrl)
      // .withHubProtocol(new MessagePackHubProtocol())
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => {
          return 1000;
        }
      })
      .build();
    connection.on("ReceiveChatMessage", (event: IChatMessage) => {
      console.log(`Got a message: ${event}`);
    });

    connection.start().then(() => {
      console.log('Connected');
    }).catch((err) => {
      return console.error(err.toString());
    });
  }

  render() {
    return content(this);
  }

  static styles = style();

}