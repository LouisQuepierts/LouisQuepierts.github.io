
class InputSystem {

    pressed = new Set();

    lockMouse = false;
    mouse = {
        changed: false,
        delta: {
            x: 0,
            y: 0
        },
        position: {
            x: 0,
            y: 0
        }
    }

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.press(e.key);
        });
        window.addEventListener('keyup', (e) => {
            this.release(e.key);
        });
        window.addEventListener('mousemove', (e) => {
            this.mouse.delta.x = e.movementX;
            this.mouse.delta.y = e.movementY;
            this.mouse.position.x = e.x;
            this.mouse.position.y = e.y;
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
        const changed = this.mouse.delta.x !== 0 || this.mouse.delta.y !== 0;
        const ret = {
            changed: changed,
            delta: {
                x: this.mouse.delta.x,
                y: this.mouse.delta.y
            },
            position: {
                x: this.mouse.position.x,
                y: this.mouse.position.y
            }
        }
        this.mouse.delta.x = 0;
        this.mouse.delta.y = 0;
        return ret;
    }
}

export default new InputSystem();