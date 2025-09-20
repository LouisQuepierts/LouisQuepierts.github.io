
out vec3 vNormalWS;

void main() {
    gl_Position = projectionMatrix  * modelViewMatrix * vec4(position, 1.0);
    vNormalWS = normalize(mat3(modelMatrix) * normal);
}