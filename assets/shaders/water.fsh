
struct Light {
    vec3 direction;
    vec3 color;
};

struct Camera {
    vec3 position;
    float near;
    float far;
};

uniform Light uDirectionalLight;
uniform Camera uCamera;

uniform mat4 uInverseProjectionMatrix;
uniform mat4 uInverseViewMatrix;

uniform vec3 uSurfaceColor;
uniform vec3 uLighterColor;
uniform vec3 uDarkerColor;
uniform vec3 uDeeperColor;
uniform vec3 uFoamColor;

uniform sampler2D uDepthTexture;
uniform sampler2D uFoamNoise;

uniform float uTime;

uniform float uFoamWidth;
uniform float uFoamNoiseScale;
uniform float uFoamNoiseAmplifier;
uniform float uFoamNoiseSpeed;
uniform float uDeepFactor;

uniform float uShininess;
uniform float uSpecularStrength;

#define uCameraNear uCamera.near
#define uCameraFar uCamera.far
#define PI 3.1415926535

flat in vec3 vFlatNormal;
flat in vec3 vFlatCDirection;
in vec4 vScreenPos;
in vec4 vWorldPos;

float calculateDepth(vec2 uv) {
    float rawDepth = texture(uDepthTexture, uv).r;

    float z = rawDepth * 2.0 - 1.0;
    float linearDepth = (2.0 * uCameraNear * uCameraFar) /
    (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
    return linearDepth;
}

vec4 depth2world(vec2 uv) {
    float depth = texture(uDepthTexture, uv).r;
    vec4 clip;
    clip.xy = uv * 2.0 - 1.0;
    clip.z = depth * 2.0 - 1.0;
    clip.w = 1.0;
    vec4 view = uInverseProjectionMatrix * clip;
    view /= view.w;
    return uInverseViewMatrix * view;
}

void main() {
    vec3 N = vFlatNormal;
    vec3 L = -uDirectionalLight.direction;
    vec3 V = vFlatCDirection;
    vec3 H = normalize(L + V);

    float NdotL = max(dot(N, L), 0.0);
    float NdotH = max(dot(N, H), 0.0);

    float diff = NdotL;
    float specular = (uShininess + 2.0) / PI * pow(NdotH, uShininess);

    float lightDot = dot(uDirectionalLight.direction, vFlatNormal);
    vec3 diffuse = mix(uSurfaceColor, uDarkerColor, clamp(lightDot / 2.0 + 0.5, 0.0, 1.0));
//    diffuse = mix(diffuse, uLighterColor, smoothstep(0.75, 1.0, lightDot));
    float blinn = diff + specular;
    diffuse = mix(diffuse, uDirectionalLight.color, blinn * uSpecularStrength);

    vec4 worldPos = depth2world(vScreenPos.xy);
    float deltaHeight = vWorldPos.y - worldPos.y;
    float height = smoothstep(0.0, 10.0 * uDeepFactor, deltaHeight);

    float foamNoise = texture(uFoamNoise, worldPos.xz * uFoamNoiseScale + uTime * uFoamNoiseSpeed).r;
    float amplified = foamNoise * uFoamNoiseAmplifier;
    float foamHeight = deltaHeight + amplified - uFoamNoiseAmplifier / 2.0;
    float foam = step(foamHeight, uFoamWidth);
//    float alpha = step(height, uFoamWidth) * step(foamNoise, 0.5);

    vec3 color = mix(uDeeperColor, diffuse, height * 0.5 + 0.5);
    color = mix(color, uFoamColor, foam);


//    color = vec3(blinn);

    float clip = step(uFoamNoiseAmplifier / 2.0, foamHeight);
//    if (clip == 0.0) discard;

    gl_FragColor = vec4(color, clip);
}