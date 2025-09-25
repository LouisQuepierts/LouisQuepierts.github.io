import {clamp} from "../math.js";

export class Animator {
    animations = new Map();

    play(name, animation) {
        if (this.animations.has(name)) {
            const old = this.animations.get(name);
            old.duration = animation.duration;
            old.action = animation.action;
            old.lerp = animation.lerp;
            old.timer = 0.0
        } else {
            this.animations.set(name, animation);
        }
    }

    stop(name) {
        this.animations.delete(name);
    }

    tick(delta) {
        const done = [];
        for (const [key, animation] of this.animations) {
            animation.tick(delta);
            if (animation.isDone()) {
                done.push(key);
            }
        }

        for (const key of done) {
            this.animations.delete(key);
        }
    }
}

export class BaseAnimation {
    duration;
    action;

    timer = 0.0;

    constructor(duration, action) {
        this.duration = duration;
        this.action = action;
    }

    isDone() {
        return this.timer > this.duration;
    }
}

export class WaitAnimation extends BaseAnimation{
    constructor(duration, action) {
        super(duration, action);
    }

    tick(delta) {
        this.timer += delta;
        if (this.timer >= this.duration) {
            this.action();
        }
    }
}

export class Animation extends BaseAnimation {
    lerp;

    constructor(duration, action, lerp = LerpFunctions.simple) {
        super(duration, action);
        this.duration = duration;
        this.timer = 0;
        this.lerp = lerp;

        this.action = action;
    }

    tick(delta) {
        this.timer += delta;
        const innerDelta = this.timer >= this.duration ? 1.0 : clamp(this.lerp(this.timer / this.duration), 0.0, 1.0);
        this.action(innerDelta);
    }
}

export class LerpFunctions {
    static simple(input) {
        return input;
    }

    static curve(input) {
        const sqr = input * input;
        return 3 * sqr - 2 * sqr * input;
    }

    static ease(input) {
        return input < 0.5 ? 2 * input * input : 1 - Math.pow(-2 * input + 2, 2) / 2;
    }
}