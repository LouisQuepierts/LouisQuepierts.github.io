
import * as THREE from "../libs/three/three.module.js";

import { Animator, Animation, LerpFunctions } from "./Animator.js";
import Ticker from "./Ticker.js";

const ANIMATOR = new Animator();
Ticker.addOperation((delta) => ANIMATOR.tick(delta));

export function rgb(name, target, duration, from, to) {
    let interpolator;
    if (from.isColor && to.isColor) {
        interpolator = Interpolator.simple(from, to);
    } else if (typeof from === "number" && typeof to === "number" || typeof from === "string" && typeof to === "string") {
        interpolator = Interpolator.simple(new THREE.Color(from), new THREE.Color(to));
    } else {
        throw "Invalid arguments for " + name;
    }
    execute(name, target, duration, interpolator);
}

export function hsl(name, target, duration, from, to) {
    let interpolator;
    if (from.isColor && to.isColor) {
        interpolator = Interpolator.hsl(from, to);
    } else if (typeof from === "number" && typeof to === "number" || typeof from === "string" && typeof to === "string") {
        interpolator = Interpolator.hsl(new THREE.Color(from), new THREE.Color(to));
    } else {
        throw "Invalid arguments for " + name;
    }
    execute(name, target, duration, interpolator);
}

export function vector(name, target, duration, from, to) {
    let interpolator;
    if ("lerp" in from && "clone" in from) {
        interpolator = Interpolator.color(from, to);
    } else {
        throw "Invalid arguments for " + name;
    }
    execute(name, target, duration, interpolator);
}

export function execute(name, target, duration, interpolator, lerpFunction = LerpFunctions.color) {
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
    static simple(from, to) {
        return (delta, target = null) => {
            if (target) {
                return target.copy(from).lerp(to, delta);
            } else {
                return from.clone().lerp(to, delta);
            }
        };
    }

    static hsl(from, to) {
        return (delta, target = null) => {
            if (target) {
                return target.copy(from).lerpHSL(to, delta);
            } else {
                return from.clone().lerpHSL(to, delta);
            }
        };
    }
}