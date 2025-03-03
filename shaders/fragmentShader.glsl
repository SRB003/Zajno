varying vec2 vUv;
uniform vec2 uMouse;
uniform sampler2D uTexture;
uniform float uHover;

void main() {
    float blocks = 30.0;
    vec2 blockUv = floor(vUv * blocks) / blocks;
    float distance = length(blockUv - uMouse);
    float effect = smoothstep(0.4, 0.0, distance);
    vec2 distortion = vec2(0.03) * effect;

    // Fetch the color with distortion effect
    vec4 color = texture2D(uTexture, vUv + distortion * uHover);

    // Convert to grayscale
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayscale = vec3(gray);

    // Mix between grayscale and original color based on uHover
    vec3 finalColor = mix(grayscale, color.rgb, uHover);

    gl_FragColor = vec4(finalColor, color.a);
}
