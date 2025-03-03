varying vec2 vUv;

void main() {
    vUv = uv;  // Pass the UV coordinates to the fragment shader
    
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
