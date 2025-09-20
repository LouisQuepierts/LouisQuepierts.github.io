flat in float vWave;

void main() {
    float g = smoothstep(-2.0, 2.0, vWave);
    gl_FragColor = vec4(1.0, g, 0.0, 1.0);
}