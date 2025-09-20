
import * as THREE from '../libs/three/three.module.js'
import {UNIFORM_DIRECTION_LIGHT} from "../global.js";

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

    constructor(window, debug = false) {
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
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.light = new THREE.DirectionalLight(0xffffff);
        this.light.position.set(5, 10, 5);
        this.light.target.position.set(0, 0, 0);

        this.solid = new THREE.Scene();
        this.transparent = new THREE.Scene();
        this.main = new THREE.Scene();

        this.depthTexture = new THREE.DepthTexture();
        this.depthTexture.type = THREE.UnsignedShortType;
        this.depthTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                depthBuffer: true,
                depthTexture: this.depthTexture
            }
        );

        this.main.add(this.solid, this.transparent);
        this.main.add(this.light, this.light.target);

        this.lightHelper = new THREE.DirectionalLightHelper(this.light, 5);
        if (debug) {
            this.main.add(this.lightHelper);
        }

        UNIFORM_DIRECTION_LIGHT.value.direction.copy(this.light.target.position).sub(this.light.position).normalize();
        UNIFORM_DIRECTION_LIGHT.value.color.copy(this.light.color);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.depthTarget.setSize(window.innerWidth, window.innerHeight);

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
        this.renderer.render(this.solid, this.camera);
        this.renderer.setRenderTarget(null);
        this.renderer.clear();

        this.renderer.render(this.main, this.camera);
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