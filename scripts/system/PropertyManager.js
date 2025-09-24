
import * as THREE from '../libs/three/three.module.js'
import * as Tween from './Tween.js'
import {MaterialManager} from "../graphic/MaterialManager.js";
import {LerpFunctions} from "./Animator.js";

const templates = new Map();
const consumers = new Map();
const properties = new Map();
const bindings = new Map();
const DEG2RAD = Math.PI / 180;

const sceneInput = document.createElement("input");
sceneInput.type = "file";
sceneInput.style.display = "none";
sceneInput.accept = ".lite";

const tmpTemplate = new Map();
let usedTemplate;

export class Property {
    name;
    type;

    _value;
    _dirty;
    _delegate;

    constructor(name, type, value, array) {
        this.name = name;
        this.type = type;
        this._value = value;
        this._dirty = true;

        this.isProperty = true;
        this.isArray = array || Array.isArray(value);
        this.isNumber = typeof value === 'number';

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

    clone() {
        if (this.isArray) {
            return new Property(this.name, this.type, [...this._value], true);
        } else if (this.isNumber) {
            return new Property(this.name, this.type, this._value, false);
        } else if ('clone' in this._value) {
            return new Property(this.name, this.type, this._value.clone(), false);
        }
        throw "Illegal clone operation";
    }

    copy(other) {
        if (this.isArray && other.isArray) {
            for (let i = 0; i < this._value.length; i++) {
                this._value[i] = other._value[i];
            }
        } else if (this.isNumber && other.isNumber) {
            this._value = other._value;
        } else if (this.type === other.type) {
            if ('copy' in this._value) {
                this._value.copy(other._value);
            } else {
                throw "Illegal target property type";
            }
        } else {
            throw "Illegal target property type";
        }
    }

    tween(duration, from, to, lerpFunction = LerpFunctions.curve) {
        if (this.isArray) {
            Tween.array(name, this, duration, from, to, lerpFunction);
        } else if (this.isNumber) {
            Tween.number(name, this, duration, from, to, lerpFunction);
        } else {
            switch (this.type) {
                case "slider":
                    Tween.number(name, this, duration, from, to, lerpFunction);
                    break;
                case "color":
                    Tween.rgb(name, this, duration, from, to, lerpFunction);
                    break;
                case "vector":
                    Tween.vector(name, this, duration, from, to, lerpFunction);
                    break;
            }
        }
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

    setupTemplate(config, name) {
        let map = templates.get(name);
        if (!map) {
            map = new Map();
            templates.set(name, map);
        }
        this.load(config, map);

        if (properties.size === 0) {
            usedTemplate = name;
            this.movTemplate(map, properties);
        }
    }

    movTemplate(src, dest) {

        if (!src || !dest) throw "Invalid template";
        if (src === dest) return;
        if (typeof src === 'string') src = templates.get(src);
        if (!src) throw "Invalid template";
        if (typeof dest === 'string') {
            dest = templates.get(dest);
            if (!dest) {
                dest = new Map();
                templates.set(dest, dest);
            }
        }

        for (let [name, property] of src) {
            const other = dest.get(name);
            if (other) {
                other.copy(property);
            } else {
                property = property.clone();
                dest.set(name, property);
            }
        }
    }

    applyTemplate(templateName, duration = 0) {
        if (usedTemplate === templateName) {
            return;
        }

        const template = templates.get(templateName);
        if (!template) throw `Template [${templateName}] not found`;
        usedTemplate = templateName;

        this.movTemplate(properties, tmpTemplate);

        for (let [name, property] of template) {
            const p = properties.get(name);
            const u = tmpTemplate.get(name);

            // if (name !== "water.uRandomDirection") continue;

            if (p && u) {
                if (Array.isArray(p.value)) {
                    Tween.array(name, p, duration, u.value, property.value, LerpFunctions.curve);
                } else {
                    switch (p.type) {
                        case "slider":
                            Tween.number(name, p, duration, u.value, property.value, LerpFunctions.curve);
                            break;
                        case "color":
                            Tween.rgb(name, p, duration, u.value, property.value, LerpFunctions.curve);
                            break;
                        case "vector":
                            Tween.vector(name, p, duration, u.value, property.value, LerpFunctions.curve);
                            break;
                    }
                }
            }
        }
    }

    load(config, dest = properties) {
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
                    value = [...item.value];
                    break;
            }
            setProperty(dest, name, type, value);
        }

        for (let [arrayName, arrayElement] of arrayLike.entries()) {
            const type = arrayElement[0].item.type;
            const array = new Array(arrayElement.length);
            for (let element of arrayElement) {
                array[element.index] = parseFloat(element.item.value);
            }
            setProperty(dest, arrayName, type, array);
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

    createProperty(name, type, value) {
        if (value instanceof Array && value.length === 1) {
            value = value[0];
        }
        let property = properties.get(name);
        if (property) {
            if (property.type !== type) {
                throw `Property [${name}] type mismatch`;
            }
            property.value = value;
        } else {
            property = new Property(name, type, value);
            properties.set(name, property);
        }
        return property;
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
        if ('x' in vec) {
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



function setProperty(dest, name, type, value, array = false) {
    const property = dest.get(name);
    if (property) {
        if (property.type !== type) {
            throw `Property [${name}] type mismatch`;
        }
        property.value = value;
    } else {
        dest.set(name, new Property(name, type, value, array));
    }
}

const INSTANCE = new PropertyManager();
export default INSTANCE;