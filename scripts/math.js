export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function smoothstep(a, b, n) {
    const t = clamp((n - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
}

export function lerp(a, b, n) {
     return (1 - n) * a + n * b;
}