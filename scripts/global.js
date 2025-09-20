
import * as THREE from "./libs/three/three.module.js"
import {MaterialManager} from "./graphic/MaterialManager.js";

const TEXTURE_LOADER = new THREE.TextureLoader();

export const FALLBACK_TEXTURE = new THREE.DataTexture(
    new Uint8Array([255, 255, 255, 255]), // RGBA = 白色
    1, 1,
    THREE.RGBAFormat
);
FALLBACK_TEXTURE.needsUpdate = true;
export const SIMPLE_NOISE_TEXTURE = loadNoise("assets/noises/simple.png");
// export const PERLIN_NOISE_TEXTURE = loadNoise("assets/noises/perlin.png");

export const UNIFORM_TIME = { value: 0.0 };
// export const UNIFORM_WORLD_LIGHT_DIRECTION = { value: new THREE.Vector3(0, -1, 0) };

export const UNIFORM_INVERSE_PROJECTION_MATRIX = { value: new THREE.Matrix4() };
export const UNIFORM_INVERSE_VIEW_MATRIX = { value: new THREE.Matrix4() };

export const UNIFORM_DEPTH_TEXTURE = { value: FALLBACK_TEXTURE };

// export const UNIFORM_SCREEN_UPPER_COLOR = { value: new THREE.Color(0xffffff) };
// export const UNIFORM_SCREEN_LOWER_COLOR = { value: new THREE.Color(0xffffff) };

export const UNIFORM_CAMERA = {
    value: {
        position: new THREE.Vector3(0, 0, 0),
        near: 0.01,
        far: 1000
    }
}

export const UNIFORM_DIRECTION_LIGHT = {
    value: {
        color: new THREE.Color(0xffffff),
        direction: new THREE.Vector3(0, -1, 0)
    }
}

export const WATER_UNIFORMS = {
    uDirectionalLight: UNIFORM_DIRECTION_LIGHT,
    uTime: UNIFORM_TIME,
    uCamera: UNIFORM_CAMERA,

    uRandomDirection: { value: 0.0 },
    uWaveCount: { value: 0 },
    uWavelength: { value: new THREE.Vector2(0.0, 0.0) },
    uSteepness: { value: new THREE.Vector2(0.0, 0.0)},
    uWaveDirection: { value: new THREE.Vector2(0.0, 0.0) },
    uDirection: { value: new THREE.Vector2(0.0, 0.0) },

    uDepthTexture: UNIFORM_DEPTH_TEXTURE,
    uInverseProjectionMatrix: UNIFORM_INVERSE_PROJECTION_MATRIX,
    uInverseViewMatrix: UNIFORM_INVERSE_VIEW_MATRIX,
    uShear: { value: new THREE.Vector2(0.0, 0.0) },

    uSurfaceColor: { value: new THREE.Color(0xffffff) },
    uLighterColor: { value: new THREE.Color(0xffffff)},
    uDarkerColor: { value: new THREE.Color(0xffffff)},
    uDeeperColor: { value: new THREE.Color(0xffffff)},

    uFoamColor: { value: new THREE.Color(0xffffff) },
    uFoamWidth: { value: 0.05 },

    uFoamNoise: { value: SIMPLE_NOISE_TEXTURE },
    uFoamNoiseScale: { value: 0.05 },
    uFoamNoiseAmplifier: { value: 0.05 },
    uFoamNoiseSpeed: { value: 0.05 },

    uDeepFactor: { value: 0.5 },
    uShininess: { value: 0.5 },
    uSpecularStrength : { value: 0.5 },
}

export const OBJECT_UNIFORMS = {
    uDirectionalLight: UNIFORM_DIRECTION_LIGHT,

    uAlbedo: { value: new THREE.Color(0xffffff) },

    uLighterColor: { value: new THREE.Color(0xffffff) },
    uDarkerColor: { value: new THREE.Color(0x000000) },
    uTransitionColor: { value: new THREE.Color(0x404040) },

    uTransition: { value: 0.5 },
    uIntensity: { value: 0.2 }
}

export const WATER_MATERIAL = await MaterialManager.createMaterial("water", WATER_UNIFORMS);
export const OBJECT_MATERIAL = await MaterialManager.createMaterial("object", OBJECT_UNIFORMS);

export function loadTexture(path) {
    return TEXTURE_LOADER.load(
        path,
        () => {
            console.log("Loaded texture: " + path);
        },
        () => {
            console.log("Loading texture: " + path);
        },
        () => {
            throw "Failed to load texture: " + path;
        }
    );
}

export function loadNoise(path) {
    const texture = loadTexture(path);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}