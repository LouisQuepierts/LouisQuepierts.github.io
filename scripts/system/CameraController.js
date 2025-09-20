
import InputSystem from "./InputSystem.js";
import * as THREE from "../libs/three/three.module.js";

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export class CameraController {
    camera;

    yaw;
    pitch;

    constructor(camera) {
        this.camera = camera;
    }

    sync() {
        const rotation = this.camera.rotation;
        this.yaw = rotation.x * RAD2DEG;
        this.pitch = rotation.y * RAD2DEG;
        console.log(rotation, this.pitch, this.yaw);
    }

    set(pitch, yaw) {
        this.camera.quaternion.setFromEuler(new THREE.Euler(
            pitch,
            yaw,
            0,
            'YXZ'
        ));
        this.pitch = pitch;
        this.yaw = yaw;
    }

    tick() {
        const forward = this.camera.getWorldDirection(new THREE.Vector3());
        const up = new THREE.Vector3(0, 1, 0);
        const left = new THREE.Vector3().crossVectors(forward, up).normalize();
        const back = new THREE.Vector3().crossVectors(left, up).normalize();

        const direction = new THREE.Vector3();

        if (InputSystem.isPressed('w')) {
            direction.sub(back);
        }

        if (InputSystem.isPressed('s')) {
            direction.add(back);
        }

        if (InputSystem.isPressed('a')) {
            direction.sub(left);
        }

        if (InputSystem.isPressed('d')) {
            direction.add(left);
        }

        direction.normalize().multiplyScalar(0.1);
        this.camera.position.add(direction);

        if (InputSystem.isPressed(' ')) {
            this.camera.position.y += 0.1;
        }

        if (InputSystem.isPressed('Shift')) {
            this.camera.position.y -= 0.1;
        }

        if (InputSystem.lockMouse) {
            const mouse = InputSystem.consumeMouse();

            if (mouse.changed) {
                this.pitch -= mouse.y * 0.005;
                this.yaw -= mouse.x * 0.005;

                this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
                this.yaw %= Math.PI * 2;

                const euler = new THREE.Euler(
                    this.pitch,
                    this.yaw,
                    0,
                    'YXZ'
                )
                const rotation = new THREE.Quaternion().setFromEuler(euler);
                this.camera.quaternion.copy(rotation);
            }
        }
    }
}