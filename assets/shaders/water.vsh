#define PI 3.14159

struct Camera {
    vec3 position;
    float near;
    float far;
};

uniform float uTime;
uniform float uRandomDirection;
uniform int uWaveCount;
uniform vec2 uWavelength;
uniform vec2 uSteepness;
uniform vec2 uWaveDirection;
uniform vec2 uDirection;
uniform vec2 uShear;

uniform Camera uCamera;

#define uShearX uShear.x
#define uShearY uShear.y

struct Gerstner {
    vec3 positionWS;
    vec3 normal;
    vec3 tangent;
};

float Random(int seed){
    return fract(sin(dot(vec2(float(seed), 2.0), vec2(12.9898, 78.233)))) * 2.0 - 1.0;
}

Gerstner GerstnerWave(
    vec2 direction,
    vec4 positionWS,
    vec2 wavelength,
    vec2 steepness,
    int waveCount,
    float randomDirection
) {
    Gerstner result;

    vec3 rPosition;
    vec3 rNormal;
    vec3 rTangent;
    float fWaveCount = float(waveCount);

    for (int i = 0; i < waveCount; i++) {
        float step = float(i) / fWaveCount;

        vec2 rand = vec2(Random(i * 13), Random(i * 41));
        vec2 d = normalize(mix(normalize(direction), rand, randomDirection));

        float _cos = uDirection.x;
        float _sin = uDirection.y;
        d = vec2(_cos * d.x - _sin * d.y, _sin * d.x + _cos * d.y);

        step = pow(step, 0.75);
        float waveLength = mix(wavelength.x, wavelength.y, step);
        float waveSteepness = mix(steepness.x, steepness.y, step) / fWaveCount;

        float k = 2.0 * PI / waveLength;
        float g = 9.81;
        float w = sqrt(g * k);
        float a = waveSteepness / k;
        vec2 waveVector = k * d;
        float value = dot(waveVector, positionWS.xz) - w * uTime;

        rPosition.x += a * cos(value) * d.x;
        rPosition.z += a * cos(value) * d.y;
        rPosition.y += a * sin(value);

        rNormal.x += -a * k * sin(value) * d.x * d.y;
        rNormal.z +=  a * k * sin(value) * d.y * d.y;
        rNormal.y +=  a * k * cos(value);

        rTangent.x += -a * k * sin(value) * d.x * d.x;
        rTangent.z +=  a * k * sin(value) * d.x * d.y;
        rTangent.y += -a * k * sin(value) * d.x;
    }

    result.positionWS.x = positionWS.x + rPosition.x;
    result.positionWS.z = positionWS.z + rPosition.z;
    result.positionWS.y = rPosition.y;
    result.normal = vec3(rNormal.x, rNormal.y, 1.0 + rNormal.z);
    result.tangent = vec3(1.0 + rTangent.x, rTangent.y, rTangent.z);

    return result;
}

vec4 computeScreenPos(vec4 clipPos) {
    vec3 ndc = clipPos.xyz / clipPos.w;
    return vec4(ndc.xy * 0.5 + 0.5, ndc.z, 1.0);
}

flat out vec3 vFlatNormal;
flat out vec3 vFlatCDirection;
out vec4 vScreenPos;
out vec4 vWorldPos;

void main() {
    mat4 shearMatrix = mat4(
        1.0, 0.0, uShearX, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
    vec4 positionWS = shearMatrix * modelMatrix * vec4(position, 1.0);
    vec3 normalWS = vec3(0.0, 1.0, 0.0); // up

    Gerstner gerstner = GerstnerWave(
        uWaveDirection,
        positionWS,
        uWavelength,
        uSteepness,
        uWaveCount,
        uRandomDirection
    );

    positionWS.xz = gerstner.positionWS.xz;
    positionWS.y += gerstner.positionWS.y;
    vec3 binormal = gerstner.normal;
    vec3 tangent = gerstner.tangent;
    vec3 normal = normalize(cross(binormal, tangent));

    gl_Position = projectionMatrix * viewMatrix * positionWS;

    vFlatNormal = normal;
    vWorldPos = positionWS;
    vFlatCDirection = normalize(uCamera.position - positionWS.xyz);
    vScreenPos = computeScreenPos(gl_Position);
}