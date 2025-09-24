import * as THREE from "../libs/three/three.module.js"

import {MaterialManager} from "../graphic/MaterialManager.js";
import InputSystem from "./InputSystem.js";
import Ticker from "./Ticker.js";
import PropertyManager from "./PropertyManager.js";

const editorElement = document.getElementById("editor");
const contentElement = document.createElement("div");
const inputElement = document.getElementById("input");

let renderer;

editorElement.appendChild(contentElement);

let nameInput = document.createElement("input");
editorElement.appendChild(nameInput);

// add save button
let saveButton = document.createElement("button");
saveButton.innerText = "Save";
saveButton.onclick = () => {
    // get name from input
    const name = nameInput.value;
    const lite = name.endsWith(".lite")
    Editor.save(name, lite);
};
editorElement.appendChild(saveButton);

// add load button
let loadButton = document.createElement("button");
loadButton.innerText = "Load";
loadButton.onclick = () => {
    inputElement.click();
};
editorElement.appendChild(loadButton);

let screenshotButton = document.createElement("button");
screenshotButton.innerText = "Screenshot";
screenshotButton.onclick = () => {
    if (!renderer) {
        return;
    }

    renderer.screenshot();
}
editorElement.appendChild(screenshotButton);

inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length > 0) {
        const file = inputElement.files[0];

        if (file.type === "application/json" || file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const json = JSON.parse(e.target.result);
                // console.log(json);
                Editor.load(json);
            };
            reader.readAsText(file);
        }
    }
})

let options = new Map();
let hidden = false;

export class Editor {
    static setRenderer(r) {
        renderer = r;
    }

    static tick() {
        if (InputSystem.consume('e')) {
            hidden = !hidden;
            editorElement.style.visibility = hidden ? "hidden" : "visible";
        }
    }

    static init(configuration) {
        editorElement.style.position = "fixed";
        editorElement.style.top = "40px";
        editorElement.style.color = "black";
        editorElement.style.height = "20%";
        editorElement.style.overflow = "auto";

        PropertyManager.load(configuration);
        // for loop to create items
        Editor.load(configuration);

        Ticker.addOperation(this.tick)
    }

    static get(name) {
        const property = PropertyManager.getProperty(name);
        if (!property) {
            throw `Property [${name}] not found`;
        }
        return property.value;
    }

    static save(file, lite) {
        // save as json
        let json = [];
        for (let [key, value] of options) {
            if (value.child) {
                continue;
            }

            const item = value.item;
            switch (value.type) {
                case "slider":
                    saveSlider(key, item, json);
                    break;
                case "checkbox":
                    saveCheckbox(key, item, json);
                    break;
                case "vector":
                    saveVector(key, item, json);
                    break;
                case "color":
                    saveColor(key, item, json);
                    break;
            }
        }

        // if lite, then remove all properties except name, type, and value
        if (lite) {
            let liteJson = [];
            for (let item of json) {
                liteJson.push({
                    name: item.name,
                    type: item.type,
                    value: item.value
                });
            }
            json = liteJson;
        }

        // write to file
        const blob = new Blob([JSON.stringify(json)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = file;
        a.click();

        URL.revokeObjectURL(url);
        a.remove();
    }

    static load(configuration) {
        for (let item of configuration) {
            switch (item.type) {
                case "slider":
                    createSlider(item.name, item);
                    break;
                case "checkbox":
                    createCheckbox(item.name, item);
                    break;
                case "vector":
                    createVector(item.name, item);
                    break;
                case "color":
                    createColor(item.name, item);
                    break;
                case "label":
                    label(item.name);
                    break;
            }
        }
    }

    static appendMaterial(name) {
        label(name);
        const config = MaterialManager.getConfig(name);
        // nameInput.value = name;

        // console.log(config);
        for (let item of config.uniforms) {
            if (item.hide || item.type === 'sampler') {
                continue;
            }

            const size = item.value.length;
            const nameWithPath = `${name}.${item.name}`;

            switch (item.type) {
                case "float_range": case "int_range": {
                    if (size === 1) {
                        createSlider(nameWithPath, item);
                    } else {
                        for (let i = 0; i < size; i++) {
                            createSlider(`${nameWithPath}[${i}]`, {
                                value: item.value[i],
                                min: item.min[i],
                                max: item.max[i],
                                step: item.step
                            });
                        }
                    }
                    break;
                }
                case "int": {
                    createVector(nameWithPath, item);
                    break;
                }
                case "float": {
                    createVector(nameWithPath, item);
                    break;
                }
                case "color":
                    createColor(nameWithPath, {
                        value: array2hex(item.value)
                    });
                    break;
                case "array": {
                    const type = item.element;
                    const length = item.value.length;
                    for (let i = 0; i < length; i++) {
                        const child = item.value[i];
                        const itemName = `${nameWithPath}[${i}]`

                        // console.log("array", child, itemName);
                        switch (type) {
                            case "float":
                                createVector(itemName, {
                                    value: child
                                });
                                break;
                        }
                    }
                    break;
                }
            }
        }
    }
}

// float array 2 hex
function array2hex(array) {
    return "#" + array.map(x => Math.floor(x * 255).toString(16).padStart(2, "0")).join("");
}

function label(text) {
    const div = createDiv(text);
    div.style.paddingTop = "10px";
}

// add a slider to editorElement
function createSlider(name, item) {
    let slider = options.get(name)?.item;
    const property = PropertyManager.createProperty(name, "slider", item.value);

    if (!slider) {
        let div = createDiv(name);
        slider = document.createElement("input");
        slider.type = "range";
        slider.min = item.min;
        slider.max = item.max;
        slider.step = item.step;
        slider.value = item.value;

        div.appendChild(slider);
        // show number
        let number = document.createElement("span");
        number.innerText = slider.value;
        div.appendChild(number);

        addOption(name, slider, "slider");

        // when slider changed, set property value
        slider.oninput = () => {
            number.innerText = slider.value;
            property.value = parseFloat(slider.value);
            property.markDirty();
        };
    } else {
        slider.min = item.min;
        slider.max = item.max;
        slider.step = item.step;
        slider.value = item.value;
        slider.oninput();
    }

    return slider;
}

function saveSlider(name, slider, out) {
    out.push({
        name: name,
        type: "slider",
        min: slider.min,
        max: slider.max,
        step: slider.step,
        value: slider.value
    });
}

function createCheckbox(name, item) {
    let checkbox = options.get(name)?.item;

    if (!checkbox) {
        let div = createDiv(name);
        checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.value;
        div.appendChild(checkbox);
        addOption(name, checkbox, "checkbox");
    }

    checkbox.type = "checkbox";
    checkbox.checked = item.value;

    return checkbox;
}

function saveCheckbox(name, checkbox, out) {
    out.push({
        name: name,
        type: "checkbox",
        value: checkbox.checked
    });
}

function createVector(name, item) {
    let vector = options.get(name)?.item;
    const size = item.value.length;

    const property = PropertyManager.createProperty(name, "vector", item.value);
    if (!vector) {
        vector = createDiv(name);

        for (let i = 0; i < size; i++) {
            let input = document.createElement("input");
            input.type = "number";
            input.value = item.value[i];
            input.step = "0.1";
            vector.appendChild(input);
            const itemName = name + "[" + i + "]";
            addOption(itemName, input, "vector", true);

            input.addEventListener('input', () => {
                property.value[i] = parseFloat(input.value);
                property.markDirty();
            })
        }
        addOption(name, vector, "vector");
    } else {
        let i = 0;

        const inputs = vector.querySelectorAll("input");
        for (let child of inputs) {
            child.value = item.value[i];
            property.value[i] = parseFloat(child.value);
            i++;

            if (i >= size) {
                break;
            }
        }
    }

    return vector;
}

function saveVector(name, div, out) {
    let vector = [];

    if (options.has(name)) {
        let child = options.get(`${name}[0]`);
        let i = 1;
        while (child) {
            vector.push(parseFloat(child.item.value));
            child = options.get(`${name}[${i}]`);
            i++;
        }
    }

    out.push({
        name: name,
        type: "vector",
        value: vector
    });
}

function createColor(name, item) {
    let color = options.get(name)?.item;
    const property = PropertyManager.createProperty(name, "color", new THREE.Color(item.value));

    if (!color) {
        let div = createDiv(name);
        color = document.createElement("input");
        color.type = "color";
        div.appendChild(color);
        addOption(name, color, "color");

        color.addEventListener("input", () => {
            property.value.set(color.value);
            property.markDirty();
        });
    }

    color.value = item.value;
    property.value.set(color.value);
    property.markDirty();
    return color;
}

function saveColor(name, color, out) {
    out.push({
        name: name,
        type: "color",
        value: color.value
    });
}

function createDiv(name) {
    let div = document.createElement("div");
    div.style.display = "flex";
    contentElement.appendChild(div);
    let label = document.createElement("label");
    label.innerText = name;
    div.appendChild(label);
    return div;
}

function addOption(name, item, type, child = false) {
    options.set(name, {
        type: type,
        item: item,
        child: child
    });
}