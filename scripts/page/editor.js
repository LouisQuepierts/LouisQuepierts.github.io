
import * as THREE from '../libs/three/three.module.js'
import * as GLOBAL from '../global.js'
import {Editor} from "../system/Editor.js";
import Ticker from "../system/Ticker.js";
import {RenderType, SimpleRenderer} from "../graphic/SimpleRenderer.js";
import {CameraController} from "../system/CameraController.js";
import InputSystem from "../system/InputSystem.js";
import PropertyManager from "../system/PropertyManager.js";
import inputSystem from "../system/InputSystem.js";
import {WATER_UNIFORMS} from "../global.js";

const editorConfig = [
    {
        "type": "label",
        "name": "Scene"
    },
    {
        "type": "slider",
        "name": "speed",
        "min": 0,
        "max": 100,
        "step": 1,
        "value": 10
    },
    {
        "type": "slider",
        "name": "water.Rotation",
        "min": -180,
        "max": 180,
        "step": 5,
        "value": 0
    },
    {
        "type": "vector",
        "name": "position",
        "value": [ 0, 0, 0 ]
    },
    {
        "type": "slider",
        "name": "tick/s",
        "min": 1,
        "max": 240,
        "step": 1,
        "value": 60
    },
    {
        "type": "label",
        "name": "Direction Light"
    },
    {
        "type": "vector",
        "name": "light.position",
        "value": [ 5, 10, 5 ]
    },
    {
        "type": "vector",
        "name": "light.target",
        "value": [ 0, 0, 0 ]
    },
    {
        "type": "color",
        "name": "light.color",
        "value": "#ffffff"
    }
]

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const renderer = new SimpleRenderer(window, true);
const controller = new CameraController(renderer.getCamera());

const cameraPosition = document.getElementById('cameraPosition');
const cameraRotation = document.getElementById('cameraRotation');

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(96, 96, 256, 256),
    GLOBAL.WATER_MATERIAL
);

const uniform = {
    water: GLOBAL.WATER_UNIFORMS,
    object: GLOBAL.OBJECT_UNIFORMS
}

const cubes = [];

init();
Ticker.run();

function init() {
    document.getElementById('canvas').appendChild(renderer.getRenderer().domElement);

    plane.position.y = 0;
    plane.rotation.x = -Math.PI / 2;
    renderer.addObject(plane, RenderType.TRANSPARENT);

    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);

    const cube0 = new THREE.Mesh(cubeGeo, GLOBAL.OBJECT_MATERIAL);
    renderer.addObject(cube0, RenderType.SOLID)
    cube0.position.set(16,-6.9,-2);
    cube0.scale.set(6,20,6);
    cubes.push(cube0);

    const cube1 = new THREE.Mesh(cubeGeo, GLOBAL.OBJECT_MATERIAL);
    renderer.addObject(cube1, RenderType.SOLID)
    cube1.position.set(7.4,-2,5);
    cube1.rotation.x = 3.5 * DEG2RAD;
    cube1.rotation.y = -5.3 * DEG2RAD;
    cube1.rotation.z = -13 * DEG2RAD;
    cube1.scale.set(3,17,4);
    cubes.push(cube1);

    const cube2 = new THREE.Mesh(cubeGeo, GLOBAL.OBJECT_MATERIAL);
    renderer.addObject(cube2, RenderType.SOLID)
    cube2.position.set(2.3,-7.9,15.7);
    cube2.rotation.y = 2 * DEG2RAD;
    cube2.rotation.z = -22.2 * DEG2RAD;
    cube2.scale.set(24,13,8);
    cubes.push(cube2);

    for (let i = 0; i < cubes.length; i++) {
        const c = cubes[i];
        const parray  = [];
        c.position.toArray(parray);
        editorConfig.push({
            type: 'vector',
            name: `cube[${i}].position`,
            value: parray
        });

        const rarray = [
            Math.round(c.rotation.x * RAD2DEG * 100) / 100,
            Math.round(c.rotation.y * RAD2DEG * 100) / 100,
            Math.round(c.rotation.z * RAD2DEG * 100) / 100
        ];
        console.log(rarray);
        editorConfig.push({
            type: 'vector',
            name: `cube[${i}].rotation`,
            value: rarray,
        });

        const sarray = [];
        c.scale.toArray(sarray);
        editorConfig.push({
            type: 'vector',
            name: `cube[${i}].scale`,
            value: sarray
        });

        PropertyManager.object(`cube[${i}]`, c);
    }

    PropertyManager.material("water");
    PropertyManager.material("object");

    const light = renderer.getLight();
    PropertyManager.vector("light.position", light.position);
    PropertyManager.vector("light.target", light.target.position);
    PropertyManager.color("light.color", light.color);

    controller.set(
        -35.264 * DEG2RAD,
        45 * DEG2RAD
    );
    const camera = renderer.getCamera();
    camera.position.set(16, 10, 16);
    // controller.sync();

    const water = uniform.water;
    water.uInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    water.uInverseViewMatrix.value.copy(camera.matrixWorldInverse);
    water.uDepthTexture.value = renderer.getDepthTarget().depthTexture;

    GLOBAL.UNIFORM_CAMERA.value.position.copy(camera.position);

    initEditor();
    PropertyManager.bind();

    /*Ticker.addOperation(() => {
        // rotate cube
        cube.rotateX(0.002);
    })*/
    Ticker.addOperation(() => InputSystem.tick())
    Ticker.addOperation(() => controller.tick());
    Ticker.addOperation(update);
    Ticker.addOperation(() => renderer.render());
    Ticker.addOperation(debugMessage);
}

function initEditor() {
    Editor.init(editorConfig);
    Editor.appendMaterial('water');
    Editor.appendMaterial('object');
}

function initUniform() {
    return GLOBAL.WATER_UNIFORMS;
}

function update(deltaTime) {
    Ticker.speed = parseFloat(Editor.get("speed")) / 1000.0;
    GLOBAL.UNIFORM_TIME.value += deltaTime;

    PropertyManager.apply();

    const water = GLOBAL.WATER_UNIFORMS;
    let rotation = parseFloat(Editor.get("water.Rotation")) * DEG2RAD;
    let cos = Math.cos(rotation);
    let sin = Math.sin(rotation);
    water.uDirection.value.set(cos, sin);

    const camera = renderer.getCamera();

    camera.updateMatrixWorld();
    water.uInverseViewMatrix.value.copy(camera.matrixWorld);
    water.uInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    water.uDepthTexture.value = renderer.getDepthTarget().depthTexture;

    water.uFoamWidth.value = parseFloat(Editor.get("water.uFoamWidth"));
    water.uFoamNoiseScale.value = parseFloat(Editor.get("water.uFoamNoiseScale"));
    water.uFoamNoiseAmplifier.value = parseFloat(Editor.get("water.uFoamNoiseAmplifier"));
    water.uFoamNoiseSpeed.value = parseFloat(Editor.get("water.uFoamNoiseSpeed"));


    const light = renderer.getLight();
    GLOBAL.UNIFORM_DIRECTION_LIGHT.value.color = light.color;
    GLOBAL.UNIFORM_DIRECTION_LIGHT.value.direction.copy(light.target.position).sub(light.position).normalize();
    renderer.updateLight();

    if (inputSystem.consume("Enter")) {
        console.log(WATER_UNIFORMS);
    }
}

function debugMessage() {
    const camera = renderer.getCamera();
    const pitch = controller.pitch;
    const yaw = controller.yaw;
    cameraPosition.innerHTML = `Position: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`

    // pitch and yaw
    cameraRotation.innerHTML = `Rotation: pitch=${pitch.toFixed(2)}, yaw=${yaw.toFixed(2)}`
}