
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

    constructor(duration, action) {
        this.duration = duration;
        this.timer = 0;

        this.action = action;
    }

    tick(delta) {
        this.timer += delta;
        this.action(this.timer / this.duration);
    }

    isDone() {
        return this.timer >= this.duration;
    }
}