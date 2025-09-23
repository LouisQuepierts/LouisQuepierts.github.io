
import * as THREE from '../libs/three/three.module.js'
import {MaterialManager} from "../graphic/MaterialManager.js";

const consumers = new Map();
const properties = new Map();
const bindings = new Map();
const DEG2RAD = Math.PI / 180;

const sceneInput = document.createElement("input");
sceneInput.type = "file";
sceneInput.style.display = "none";
sceneInput.accept = ".lite";

export class Property {
    name;
    type;

    _value;
    _dirty;
    _delegate;

    constructor(name, type, value) {
        this.name = name;
        this.type = type;
        this._value = value;
        this._dirty = true;

        this.isProperty = true;

        Object.freeze(this.name);
        Object.freeze(this.type);
    }

    set value(v) {
        if (this._value !== v) {
            this._value = v;
            this._dirty = true;
        }
    }

    get value() {
        return this._delegate ? this._delegate() : this._value;
    }

    get dirty() {
        return this._dirty;
    }

    markDirty() {
        this._dirty = true;
    }

    bind(supplier) {
        this._delegate = supplier;
    }
}

class PropertyManager {
    constructor() {
    }

    async fromAssets(file) {
        const path = `assets/preset/${file}`;
        const content = await fetch(path).then(response => {
            if (!response.ok) {
                throw `Preset [${file}] not found`;
            }
            return response.text();
        });
        const json = JSON.parse(content);
        this.load(json);
    }

    load(config) {
        properties.clear();
        const arrayLike = new Map();

        for (let item of config) {
            const name = item.name;
            const type = item.type;

            // if name is similar to xxx[2]
            // then it would be an array
            if (name[name.length - 1] === ']') {
                const leftB = name.lastIndexOf('[');
                const arrayName = name.substring(0, leftB);
                const index = parseInt(name.substring(leftB + 1, name.length - 1));
                const element = {
                    item: item,
                    index: index
                };
                if (arrayLike.has(arrayName)) {
                    arrayLike.get(arrayName).push(element);
                } else {
                    arrayLike.set(arrayName, [element]);
                }
                continue;
            }

            let value;
            switch (type) {
                case "slider":
                    value = parseFloat(item.value);
                    break;
                case "color":
                    value = new THREE.Color(item.value);
                    break;
                case "vector":
                    value = item.value;
                    break;
            }
            setProperty(name, type, value);
        }

        for (let [arrayName, arrayElement] of arrayLike.entries()) {
            const type = arrayElement[0].item.type;
            const array = new Array(arrayElement.length);
            for (let element of arrayElement) {
                array[element.index] = element.item.value;
            }
            setProperty(arrayName, type, array);
        }

        function setProperty(name, type, value) {
            const property = properties.get(name);
            if (property) {
                if (property.type !== type) {
                    throw `Property [${name}] type mismatch`;
                }
                property.value = value;
            } else {
                properties.set(name, new Property(name, type, value));
            }
        }
    }

    save(output) {
        for (let property of properties.values()) {
            output.push({
                name: property.name,
                type: property.type,
                value: property._value
            });
        }
    }

    bind() {
        bindings.clear();
        for (let [name, property] of properties) {
            const consumer = consumers.get(name);
            if (consumer) {
                bindings.set(consumer, property);
            }
        }
        console.log(bindings);
    }

    apply(force = false) {
        for (const [consumer, property] of bindings) {
            if (property.dirty || force) {
                consumer(property.value);
                property._dirty = false;
            }
        }
    }

    getProperty(name) {
        return properties.get(name);
    }

    register(name, consumer) {
        consumers.set(name, consumer);
        const property = properties.get(name);
        if (property) {
            bindings.set(consumer, property);
        }
    }

    vector(name, vec) {
        /*if ('x' in vec) {
            this.register(name + "[0]", (value) => vec.x = value);
        }

        if ('y' in vec) {
            this.register(name + "[1]", (value) => vec.y = value);
        }

        if ('z' in vec) {
            this.register(name + "[2]", (value) => vec.z = value);
        }

        if ('w' in vec) {
            this.register(name + "[3]", (value) => vec.w = value);
        }
*/
        this.register(name, (value) => vec.fromArray(value));
    }

    color(name, col) {
        this.register(name, (value) => col.set(value));
    }

    angle(name, euler) {
        this.register(name, (value) => {
            euler.set(
                value[0] * DEG2RAD,
                value[1] * DEG2RAD,
                value[2] * DEG2RAD,
            );
        })
    }

    object(name, obj) {
        this.vector(name + ".position", obj.position);
        this.angle(name + ".rotation", obj.rotation);
        this.vector(name + ".scale", obj.scale);
    }

    material(name) {
        const mat = MaterialManager.get(name);
        const config = MaterialManager.getConfig(name);

        for (let item of config.uniforms) {
            if (item.hide || item.type === 'sampler') {
                continue;
            }

            const uniform = mat.uniforms[item.name];
            this.uniform(name + "." + item.name, uniform);
        }
    }

    uniform(name, u) {
        const value = u.value;
        if (typeof value === 'number') {
            this.register(name, (value) => u.value = value);
        } else if (value.isColor) {
            this.color(name, value);
        } else if (typeof value.fromArray === 'function') {
            this.vector(name, value);
        }
    }
}

const INSTANCE = new PropertyManager();
export default INSTANCE;