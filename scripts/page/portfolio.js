import * as THREE from '../libs/three/three.module.js'
import * as GLOBAL from "../global.js";
import * as TEMPLATE from "../templates.js"

import Ticker from "../system/Ticker.js";
import PropertyManager from "../system/PropertyManager.js";
import InputSystem from "../system/InputSystem.js";
import {SimpleRenderer, RenderType} from "../graphic/SimpleRenderer.js";
import {CameraController} from "../system/CameraController.js";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const renderer = new SimpleRenderer(window);
const controller = new CameraController(renderer.getCamera());

await init();
Ticker.run();

async function init() {
    const canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.getRenderer().domElement);

    const plane = createWater(64);

    plane.position.y = 0;
    plane.position.x = plane.position.z = 8;
    plane.rotation.x = -Math.PI / 2;
    renderer.addObject(plane, RenderType.TRANSPARENT);

    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);

    const cube0 = new THREE.Mesh(cubeGeo, GLOBAL.OBJECT_MATERIAL);
    renderer.addObject(cube0, RenderType.SOLID);
    PropertyManager.object("cube[0]", cube0);

    const cube1 = new THREE.Mesh(cubeGeo, GLOBAL.OBJECT_MATERIAL);
    renderer.addObject(cube1, RenderType.SOLID)
    PropertyManager.object("cube[1]", cube1);

    const cube2 = new THREE.Mesh(cubeGeo, GLOBAL.OBJECT_MATERIAL);
    renderer.addObject(cube2, RenderType.SOLID)
    PropertyManager.object("cube[2]", cube2);

    const light = renderer.getLight();
    PropertyManager.register("light.position", (property) => {
        light.position.fromArray(property.value);
        GLOBAL.UNIFORM_DIRECTION_LIGHT.value.direction.copy(light.target.position).sub(light.position).normalize();
    });
    PropertyManager.register("light.target", (property) => {
        light.target.position.fromArray(property.value);
        GLOBAL.UNIFORM_DIRECTION_LIGHT.value.direction.copy(light.target.position).sub(light.position).normalize();
    });
    PropertyManager.color("light.color", GLOBAL.UNIFORM_DIRECTION_LIGHT.value.color);

    const camera = renderer.getCamera();
    camera.position.set(16, 10, 16);
    controller.set(
        -35.264 * DEG2RAD,
        45 * DEG2RAD
    );
    // controller.sync();

    const water = GLOBAL.WATER_UNIFORMS;
    camera.updateMatrixWorld();
    GLOBAL.UNIFORM_INVERSE_VIEW_MATRIX.value.copy(camera.matrixWorld);
    GLOBAL.UNIFORM_INVERSE_PROJECTION_MATRIX.value.copy(camera.projectionMatrixInverse);
    GLOBAL.UNIFORM_DEPTH_TEXTURE.value = renderer.getDepthTarget().depthTexture;

    GLOBAL.UNIFORM_CAMERA.value.position.copy(camera.position);

    PropertyManager.setupTemplate(TEMPLATE.STYLE_HOME, "home");
    PropertyManager.setupTemplate(TEMPLATE.STYLE_JOURNEY, "journey");
    PropertyManager.setupTemplate(TEMPLATE.STYLE_PROJECTS, "projects");

    PropertyManager.material("object");
    PropertyManager.material("water");

    PropertyManager.register("speed", (property) => Ticker.setSpeed(property.value / 1000.0));
    PropertyManager.register("water.Rotation", (property) => {
        const rotation = property.value * DEG2RAD;
        let cos = Math.cos(rotation);
        let sin = Math.sin(rotation);
        water.uDirection.value.set(cos, sin);
    })

    PropertyManager.bind();
    PropertyManager.apply()

    // Ticker.addOperation(() => InputSystem.tick())
    // Ticker.addOperation(() => controller.tick());
    Ticker.addOperation(uploadUniformOperation);
    Ticker.addOperation(test);
    Ticker.addOperation(() => renderer.render());
    Ticker.tps = 30;

    TEMPLATE.ACTIONS.set("home", (t = 0.2) => apply("home", t));
    TEMPLATE.ACTIONS.set("about", (t = 0.2) => apply("journey", t))
    TEMPLATE.ACTIONS.set("journey", (t = 0.2) => apply("journey", t));
    TEMPLATE.ACTIONS.set("projects", (t = 0.2) => apply("projects", t));

    const placeholder = document.getElementById("canvas-placeholder");
    placeholder.remove();

    function apply(template, duration) {
        PropertyManager.applyTemplate(template, duration);
    }
}

function createWater(size) {
    const scale = Math.round(size / 0.375);
    return new THREE.Mesh(
        new THREE.PlaneGeometry(size, size, scale, scale),
        GLOBAL.WATER_MATERIAL
    );
}

function uploadUniformOperation(deltaTime) {
    GLOBAL.UNIFORM_TIME.value += deltaTime;

    PropertyManager.apply();
}

function test(deltaTime) {
    if (InputSystem.isPressed("Control") && InputSystem.consume("S")) {
        renderer.screenshot();
    }

    if (InputSystem.consume("Enter")) {
        console.log(GLOBAL.WATER_UNIFORMS);
    }
}