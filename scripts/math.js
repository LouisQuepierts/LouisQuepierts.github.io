function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function smoothstep(a, b, n) {
    const t = clamp((n - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
}