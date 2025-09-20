#define WAVE_NUM 4.0
#define WAVE_NUM_I 4
#define PI 3.14159
#define EIPSILON 1e-6

uniform float uTime;
uniform float uSteepness;
uniform float uSpeed;
uniform vec4 uWave[WAVE_NUM_I];

struct Wave {
    vec3 position;
    vec3 normal;
};

float calculateWave(vec3 pos, float amplitude, float wavelength, float speed, float direction) {
    float time = uTime;
    float frequency = 2.0 / max(wavelength, 1e-6);
    direction = radians(direction);
    vec2 forward = normalize(vec2(cos(direction), sin(direction)));

    float d = dot(pos.xz, forward);
    return amplitude * sin((d + time * speed) * frequency);
}

Wave GerstnerWave(vec2 posXZ, float amp, float waveLen, float speed, float dir) // 传入的是每一个波形的效果，最后叠加，然后由UI参数统一调控。
{
    Wave o;
    float w = 2.0 * PI / waveLen;
    float A = amp;
    float WA = w * A;
    float Q = uSteepness / (WA * WAVE_NUM);
    float dirRad = radians(dir);
    vec2 D = normalize(vec2(sin(dirRad), cos(dirRad)));
    float com = w * dot(D, posXZ) + uTime * sqrt(9.8 * w) * speed * uSpeed;

    float sinC = sin(com);
    float cosC = cos(com);
    o.position.xy = Q * A * D.xy * cosC;
    o.position.z = A * sinC / WAVE_NUM;
    o.normal.xy = -D.xy * WA * cosC;
    o.normal.z = -Q * WA * sinC;
    return o;
}

vec3 calculateWave_at(vec3 vertex) {
    vec3 wave = vec3(0);

    for (int i = 0; i < WAVE_NUM_I; i++) {
        wave += calculateWave(vertex, uWave[i].x, uWave[i].y, uWave[i].z, uWave[i].w);
    }
    //    wave += calculateWave(vertex, uWave[1].x, uWave[1].y, uWave[1].z, uWave[1].w);
    //    wave += calculateWave(vertex, uWave[2].x, uWave[2].y, uWave[2].z, uWave[2].w);
    //    wave += calculateWave(vertex, uWave[3].x, uWave[3].y, uWave[3].z, uWave[3].w);

    return wave;
}

flat out vec3 vNormal;
out vec3 vPositionCS;
out vec3 vPositionWS;

void main() {
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    vec3 waveOffset = vec3(0.0);
    vec3 waveNormal = vec3(0.0);

    float factor;
    for (int i = 0; i < WAVE_NUM_I; i++) {
        Wave wave = GerstnerWave(worldPosition.xz, max(uWave[i].x, EIPSILON), max(uWave[i].y, EIPSILON), uWave[i].z, uWave[i].w);
        // if amplifier equ
        factor = step(EIPSILON, uWave[i].x);
        waveOffset += wave.position * factor;
        waveNormal += wave.normal * factor;
    }

    vec4 pos = vec4(position + waveOffset, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * pos;
    vNormal = normalize(mat3(modelMatrix) * waveNormal);

    vPositionCS = gl_Position.xyz / gl_Position.w;
    vPositionWS = pos.xyz;
}
