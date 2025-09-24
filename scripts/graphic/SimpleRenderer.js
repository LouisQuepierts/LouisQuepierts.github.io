
import * as THREE from '../libs/three/three.module.js'
import * as GLOBAL from '../global.js'

const RATIO = 0.5;
const imgElement = new Image();
document.body.appendChild(imgElement);
const linkElement = document.createElement('a');

export class SimpleRenderer {
    camera;
    renderer;

    light;
    lightHelper;

    solid;
    transparent;
    main;

    depthTexture;
    depthTarget;

    width;
    height;

    constructor(window, debug = false) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 10;

        this.camera = new THREE.OrthographicCamera(
            -frustumSize * aspect,
            frustumSize * aspect,
            frustumSize,
            -frustumSize,
            0.1,
            1000
        )
        const hWidth = this.width * RATIO;
        const hHeight = this.height * RATIO;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(hWidth, hHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio * 0.8);

        const dom = this.renderer.domElement;
        dom.style.width = this.width + 'px';
        dom.style.height = this.height + 'px';

        this.light = new THREE.DirectionalLight(0xffffff);
        this.light.position.set(5, 10, 5);
        this.light.target.position.set(0, 0, 0);

        this.solid = new THREE.Scene();
        this.transparent = new THREE.Scene();
        this.main = new THREE.Scene();

        this.depthTexture = new THREE.DepthTexture(hWidth, hHeight);
        this.depthTexture.type = THREE.UnsignedShortType;
        this.depthTexture.minFilter = THREE.NearestFilter;
        this.depthTexture.magFilter = THREE.NearestFilter;
        this.depthTarget = new THREE.WebGLRenderTarget(
            hWidth,
            hHeight,
            {
                depthBuffer: true,
                depthTexture: this.depthTexture
            }
        );

        this.main.add(this.solid, this.transparent);
        this.main.add(this.light, this.light.target);

        if (debug) {
            this.lightHelper = new THREE.DirectionalLightHelper(this.light, 5);
            this.main.add(this.lightHelper);
        }

        GLOBAL.UNIFORM_DIRECTION_LIGHT.value.direction.copy(this.light.target.position).sub(this.light.position).normalize();
        GLOBAL.UNIFORM_DIRECTION_LIGHT.value.color.copy(this.light.color);

        window.addEventListener('resize', () => {
            if (this.width >= window.innerWidth && this.height >= window.innerHeight) {
                return;
            }

            this.width = window.innerWidth;
            this.height = window.innerHeight;

            const hWidth = this.width * RATIO;
            const hHeight = this.height * RATIO;

            this.renderer.setSize(hWidth, hHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio * 0.8);
            this.depthTarget.setSize(hWidth, hHeight);

            const dom = this.renderer.domElement;
            dom.style.width = this.width + 'px';
            dom.style.height = this.height + 'px';

            const aspect = window.innerWidth / window.innerHeight;
            const frustumSize = 10;
            this.camera.left = -frustumSize * aspect;
            this.camera.right = frustumSize * aspect;
            this.camera.top = frustumSize;
            this.camera.bottom = -frustumSize;
            this.camera.updateProjectionMatrix();
        })
    }

    render() {
        this.renderer.setRenderTarget(this.depthTarget);
        this.renderer.clear();
        this.renderer.render(this.solid, this.camera);

        this.renderer.setRenderTarget(null);
        this.renderer.clear();
        this.renderer.render(this.main, this.camera);

        if (this.shouldScreenshot) {
            const dataURL = this.renderer.domElement.toDataURL("image/png");

            imgElement.src = dataURL;

            const timestamp = new Date().getTime();
            linkElement.href = dataURL;
            linkElement.download = `screenshot-${timestamp}.png`;
            linkElement.click();
            this.shouldScreenshot = false;
        }
    }

    addObject(object, renderType) {
        switch (renderType) {
            case RenderType.SOLID:
                this.solid.add(object);
                break;
            case RenderType.TRANSPARENT:
                this.transparent.add(object);
                break;
            default:
                throw "Invalid render type";
        }
    }

    screenshot() {
        this.shouldScreenshot = true;
    }

    removeObject(object, renderType) {
        switch (renderType) {
            case RenderType.SOLID:
                this.solid.remove(object);
                break;
            case RenderType.TRANSPARENT:
                this.transparent.remove(object);
                break;
            default:
                throw "Invalid render type";
        }
    }

    getLight() {
        return this.light;
    }

    updateLight() {
        this.lightHelper?.update();
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    getDepthTarget() {
        return this.depthTarget;
    }

    getDepthTexture() {
        return this.depthTexture;
    }
}

export class RenderType {
    static SOLID = 0;
    static TRANSPARENT = 1;
}