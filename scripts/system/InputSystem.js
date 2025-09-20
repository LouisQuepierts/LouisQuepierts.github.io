
class InputSystem {

    pressed = new Set();

    lockMouse = false;
    mouseDeltaX = 0;
    mouseDeltaY = 0;

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.press(e.key);
        });
        window.addEventListener('keyup', (e) => {
            this.release(e.key);
        });
        window.addEventListener('mousemove', (e) => {
            this.mouseDeltaX = e.movementX;
            this.mouseDeltaY = e.movementY;
        });
    }

    tick() {
        if (this.consume('Control')) {
            this.lockMouse = !this.lockMouse;
            if (this.lockMouse) {
                document.body.requestPointerLock().then();
            } else {
                document.exitPointerLock();
            }
        }
    }

    press(key) {
        this.pressed.add(key);
    }

    consume(key) {
        if (this.pressed.has(key)) {
            this.pressed.delete(key);
            return true;
        }

        return false;
    }

    release(key) {
        this.pressed.delete(key);
    }

    isPressed(key) {
        return this.pressed.has(key);
    }

    consumeMouse() {
        const changed = this.mouseDeltaX !== 0 || this.mouseDeltaY !== 0;
        const ret = {
            changed: changed,
            x: this.mouseDeltaX,
            y: this.mouseDeltaY
        }
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        return ret;
    }
}

export default new InputSystem();