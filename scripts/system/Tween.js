
import { Animator, Animation } from "./Animator.js";
import Ticker from "./Ticker.js";

const ANIMATOR = new Animator();
Ticker.addOperation((delta) => ANIMATOR.tick(delta));

export function float(setter, from, to, duration) {
    ANIMATOR.play("float", new Animation(duration, (delta) => {
        setter(from + (to - from) * delta);
    }));
}

export function lerp(setter, from, to, duration) {
    ANIMATOR.play("color", new Animation(duration, (delta) => {
        setter(from.lerp(to, delta));
    }));
}