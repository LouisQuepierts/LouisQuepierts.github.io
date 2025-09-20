#define WAVE_NUM 4.0
#define PI 3.14159

uniform float uTime;
uniform float uSteepness;
uniform float uSpeed;
uniform vec4 uWave[4];

float calculateWave(vec3 pos, float amplitude, float wavelength, float speed, float direction) {
    float time = uTime;
    float frequency = 2.0 / max(wavelength, 1e-6);
    direction = radians(direction);
    vec2 forward = normalize(vec2(cos(direction), sin(direction)));

    float d = dot(pos.xz, forward);
    return amplitude * sin((d + time * speed) * frequency);
}

vec3 GerstnerWave(vec2 posXZ, float amp, float waveLen, float speed, float dir) // 传入的是每一个波形的效果，最后叠加，然后由UI参数统一调控。
{
    vec3 o;
    float w = 2.0 * PI / waveLen;
    float A = amp;
    float WA = w * A;
    float Q = uSteepness / (WA * WAVE_NUM);
    float dirRad = radians(dir);
    vec2 D = normalize(vec2(sin(dirRad), cos(dirRad)));
    float com = w * dot(D, posXZ) + uTime * sqrt(9.8 * w) * speed * uSpeed;

    float sinC = sin(com);
    float cosC = cos(com);
    o.xy = Q * A * D.xy * cosC;
    o.z = A * sinC / WAVE_NUM;
    return o;
}

vec3 calculateWave_at(vec3 vertex) {
    vec3 wave = vec3(0);

    wave += GerstnerWave(vertex.xz, uWave[0].x, uWave[0].y, uWave[0].z, uWave[0].w);
//    wave += calculateWave(vertex, uWave[1].x, uWave[1].y, uWave[1].z, uWave[1].w);
//    wave += calculateWave(vertex, uWave[2].x, uWave[2].y, uWave[2].z, uWave[2].w);
//    wave += calculateWave(vertex, uWave[3].x, uWave[3].y, uWave[3].z, uWave[3].w);

    return wave;
}

flat out float vWave;

void main() {
    vec3 wave = calculateWave_at((modelMatrix * vec4(position, 1.0)).xyz);
    vec4 pos = vec4(position, 1.0);
    pos.xyz += wave;
    gl_Position = projectionMatrix * modelViewMatrix * pos;
    vWave = wave.z;
}
