
export class Animator {
    animations = new Map();

    play(name, animation) {
        this.animations.set(name, animation);
    }

    tick(delta) {
        for (let animation of this.animations.values()) {
            animation.tick(delta);
            if (animation.isDone()) {
                this.animations.delete(animation);
            }
        }
    }
}

export class Animation {
    duration;
    timer;

    action;
    lerp;

    constructor(duration, action, lerp = LerpFunctions.color) {
        this.duration = duration;
        this.timer = 0;
        this.lerp = lerp;

        this.action = action;
    }

    tick(delta) {
        this.timer += delta;
        const innerDelta = this.lerp(this.timer / this.duration);
        this.action(innerDelta);
    }

    isDone() {
        return this.timer >= this.duration;
    }
}

export class LerpFunctions {
    static simple(input) {
        return input;
    }
}