
import * as THREE from "../libs/three/three.module.js";

import {Animator, Animation, LerpFunctions, WaitAnimation} from "./Animator.js";
import Ticker from "./Ticker.js";

export const ANIMATOR = new Animator();
Ticker.addOperation((delta) => ANIMATOR.tick(delta));

export function cancel(name) {
    ANIMATOR.stop(name);
}

export function wait(name, callback, time) {
    ANIMATOR.play(name, new WaitAnimation(time, callback));
}

export function rgb(name, target, duration, from, to, lerpFunction = LerpFunctions.simple) {
    let interpolator;
    if (from.isColor && to.isColor) {
        interpolator = Interpolator.simple(from, to);
    } else if (typeof from === "number" && typeof to === "number" || typeof from === "string" && typeof to === "string") {
        interpolator = Interpolator.simple(new THREE.Color(from), new THREE.Color(to));
    } else {
        throw "Invalid arguments for " + name;
    }
    execute(name, target, duration, interpolator, lerpFunction);
}

export function hsl(name, target, duration, from, to, lerpFunction = LerpFunctions.simple) {
    let interpolator;
    if (from.isColor && to.isColor) {
        interpolator = Interpolator.hsl(from, to);
    } else if (typeof from === "number" && typeof to === "number" || typeof from === "string" && typeof to === "string") {
        interpolator = Interpolator.hsl(new THREE.Color(from), new THREE.Color(to));
    } else {
        throw "Invalid arguments for " + name;
    }
    execute(name, target, duration, interpolator, lerpFunction);
}

export function vector(name, target, duration, from, to, lerpFunction = LerpFunctions.simple) {
    let interpolator;
    if ("lerp" in from && "clone" in from) {
        interpolator = Interpolator.simple(from, to);
    } else {
        throw "Invalid arguments for " + name;
    }
    execute(name, target, duration, interpolator, lerpFunction);
}

export function array(name, target, duration, from, to, lerpFunction = LerpFunctions.simple) {
    execute(name, target, duration, Interpolator.array(from, to), lerpFunction);
}

export function number(name, target, duration, from, to, lerpFunction = LerpFunctions.simple) {
    execute(name, target, duration, Interpolator.number(from, to), lerpFunction);
}

export function execute(name, target, duration, interpolator, lerpFunction = LerpFunctions.simple) {
    let action;
    if (typeof target === "function") {
        action = delta => target(interpolator(delta));
    }  else if (target.isProperty) {
        if (typeof target.value === 'number') {
            action = delta => target.value = interpolator(delta);
        } else {
            action = delta => {
                interpolator(delta, target.value);
                target.markDirty();
            }
        }
    } else {
        action = delta => interpolator(delta, target);
    }

    ANIMATOR.play(name, new Animation(duration, action, lerpFunction));
}

export class Interpolator {
    static number(from, to) {
        return (delta, target = null) => this.number0(from, to, delta, target);
    }

    static number0(from, to, delta, target = null) {
        if (target) {
            return target.lerp(from, to, delta);
        } else {
            return from + (to - from) * delta;
        }
    }

    static simple(from, to) {
        return (delta, target = null) => this.simple0(from, to, delta, target);
    }

    static simple0(from, to, delta, target = null) {
        if (target) {
            return target.copy(from).lerp(to, delta);
        } else {
            return from.clone().lerp(to, delta);
        }
    }

    static hsl(from, to) {
        return (delta, target = null) => this.hsl0(from, to, delta, target);
    }

    static hsl0(from, to, delta, target = null) {
        if (target) {
            return target.copy(from).lerpHSL(to, delta);
        } else {
            return from.clone().lerpHSL(to, delta);
        }
    }

    static array(from, to) {
        return (delta, target = null) => this.array0(from, to, delta, target);
    }

    static array0(from, to, delta, target = null) {
        if (target) {
            for (let i = 0; i < from.length; i++) {
                target[i] = from[i] + (to[i] - from[i]) * delta;
            }
            return target;
        } else {
            throw "Invalid arguments for array interpolator";
        }
    }
}