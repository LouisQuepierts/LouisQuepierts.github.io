
import * as THREE from '../libs/three/three.module.js'

let shaders = new Map();
let materials = new Map();

export const FALLBACK_TEXTURE = new THREE.DataTexture(
    new Uint8Array([255, 255, 255, 255]), // RGBA = 白色
    1, 1,
    THREE.RGBAFormat
);
FALLBACK_TEXTURE.needsUpdate = true;

export class MaterialManager {

    static async createMaterial(name, uniforms) {
        if (materials.has(name)) {
            throw `Material [${name}] already exists`;
        }

        console.log(`Creating material [${name}]`);
        const config = await loadProgram(name);

        const vertURL = config.vertex;
        const fragURL = config.fragment;
        const alphaTest = config.alphaTest ? config.alphaTest : 0;
        const transparent = config.transparent ? config.transparent : false;

        console.log(`Shader [${name}] loaded`, alphaTest)

        const [vert, frag] = await Promise.all([
            loadShader(vertURL),
            loadShader(fragURL)
        ]);

        if (!uniforms) {
            uniforms = {};
            for (let [,value] of Object.entries(config.uniforms)) {

                const uniformType = getUniformType(value);
                const name = value.name;
                uniforms[name] = {value: getUniformValue(uniformType, value)}
            }
        }

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: vert,
            fragmentShader: frag,
            alphaTest: alphaTest,
            transparent: transparent
        });

        materials.set(name, {
            config: config,
            material: material
        });

        return material;
    }

    static get(name) {
        if (!materials.has(name)) {
            throw `Material [${name}] not found`;
        }
        return materials.get(name).material;
    }

    static getConfig(name) {
        if (!materials.has(name)) {
            throw `Material [${name}] not found`;
        }
        return materials.get(name).config;
    }
}

function getUniformType(uniformConfig) {
    // console.log(uniformConfig)
    switch (uniformConfig.type) {
        case "array": case "sampler":
            return null;
        default:
            return toThreeType(uniformConfig.type, uniformConfig.size);
    }
}

function getUniformValue(type, uniformConfig) {
    switch (type) {
        case "f": case "i": case "v2":  case "v3": case "v4": case "c": case "mat":
            return toThreeObject(type, uniformConfig.value);
    }

    if (uniformConfig.type === "array") {
        const size = uniformConfig.value[0].length;
        const elementType = toThreeType(uniformConfig.element, size);
        const array = [];
        for (let i = 0; i < uniformConfig.value.length; i++) {
            array.push(toThreeObject(elementType, uniformConfig.value[i]));
        }
        return array;
    }

    if (uniformConfig.type === "sampler") {
        return FALLBACK_TEXTURE;
    }

    throw `Unsupported uniform type [${uniformConfig.type}]`;
}

function toThreeType(type, size) {
    switch (type) {
        case "float": case "float_range":
            if (size === undefined || size === 1) {
                return "f";
            } else if (size === 16) {
                return "mat";
            } else {
                return `v${size}`;
            }
        case "int": case "int_range":
            if (size === undefined || size === 1) {
                return "i";
            } else {
                return `iv${size}`;
            }
        case "color":
            return "c";
        case "array": case "sampler":
            return null;
    }

    throw `Unsupported uniform type [${type}]`;
}

function toThreeObject(type, object) {
    switch (type) {
        case "f":
            return parseFloat(object);
        case "i":
            return parseInt(object);
        case "v2":
            return new THREE.Vector2(object[0], object[1]);
        case "v3":
            return new THREE.Vector3(object[0], object[1], object[2]);
        case "v4":
            return new THREE.Vector4(object[0], object[1], object[2], object[3]);
        case "mat":
            return new THREE.Matrix4().fromArray(object);
        case "c":
            return new THREE.Color(object[0], object[1], object[2]);
    }

    throw `Unsupported uniform type [${type}]`;
}

async function loadShader(name) {
    if (shaders.has(name)) {
        return shaders.get(name);
    }

    const url = `assets/shaders/${name}`;
    console.log(`Loading shader [${name}] from [${url}]`);
    const source = await fetch(url).then(response => {
        if (!response.ok) {
            throw `Shader [${name}] not found`;
        }
        return response.text();
    });

    shaders.set(name, source);
    return source;
}

async function loadProgram(name) {
    // if name end with .json, then it's a json file
    const url = name.endsWith(".json") ? `assets/programs/${name}` : `assets/programs/${name}.json`;
    console.log(`Loading program [${name}] from [${url}]`);
    return fetch(url).then(response => {
        if (!response.ok) {
            throw `Program [${name}] not found`;
        }
        return response.json();
    });
}