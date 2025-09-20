
struct DirectionalLight {
    vec3 direction;
    vec3 color;
};

uniform DirectionalLight uDirectionalLight;

uniform vec3 uAlbedo;

uniform vec3 uLighterColor;
uniform vec3 uDarkerColor;
uniform vec3 uTransitionColor;

uniform float uTransition;
uniform float uIntensity;

in vec3 vNormalWS;

void main() {
    vec3 normal = normalize(vNormalWS);
    float dotL = dot(normal, uDirectionalLight.direction);

    vec3 ambient = mix(
        mix(
            uLighterColor,
            uTransitionColor,
            smoothstep(-1.0, uTransition, dotL)
        ),
        uDarkerColor,
        smoothstep(uTransition, 1.0, dotL)
    );

//    ambient = mix(uAlbedo, ambient, uIntensity);
//    ambient = vec3((dotL + 1.0) / 2.0);
    gl_FragColor = vec4(ambient, 1.0);
}