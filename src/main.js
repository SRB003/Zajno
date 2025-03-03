import LocomotiveScroll from 'locomotive-scroll';
import * as THREE from 'three';
import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';
import gsap from 'gsap';

const locomotiveScroll = new LocomotiveScroll();

// Create a scene
const scene = new THREE.Scene();

const distance = 600;
const fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);

// Create a camera
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = distance;

// Create a renderer
const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Select images
const images = document.querySelectorAll('img');
const planes = [];

images.forEach((img) => {
    const imgbounds = img.getBoundingClientRect();
    const geometry = new THREE.PlaneGeometry(imgbounds.width, imgbounds.height);
    const texture = new THREE.TextureLoader().load(img.src);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: texture },
            uMouse: { value: new THREE.Vector2(0.5, 0) },
            uHover: { value: 0 }
        },
        vertexShader,
        fragmentShader
    });

    const plane = new THREE.Mesh(geometry, material);

    // Correct plane positioning
    plane.position.set(
        imgbounds.left - window.innerWidth / 2 + imgbounds.width / 2,
        -imgbounds.top + window.innerHeight / 2 - imgbounds.height / 2,
        0
    );
    planes.push(plane);
    scene.add(plane);
});

// Function to update plane positions dynamically
function updatePlanePosition() {
    planes.forEach((plane, index) => {
        const image = images[index];
        const imgbounds = image.getBoundingClientRect();
        plane.position.set(
            imgbounds.left - window.innerWidth / 2 + imgbounds.width / 2,
            -imgbounds.top + window.innerHeight / 2 - imgbounds.height / 2,
            0
        );
    });
}

// Initialize raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Mouse move event to apply raycasting with GSAP hover effect
window.addEventListener('mousemove', (e) => {
    // Convert mouse position to normalized device coordinates (NDC)
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Cast a ray from the camera
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(planes);

    // Reset uHover for all planes smoothly
    planes.forEach((plane) => {
        gsap.to(plane.material.uniforms.uHover, { value: 0, duration: 0.5, ease: "power2.out" });
    });

    // Animate only the intersected plane's uniform
    if (intersects.length > 0) {
        const intersectedPlane = intersects[0].object;
        gsap.to(intersectedPlane.material.uniforms.uHover, { value: 1, duration: 0.3, ease: "power2.out" });
        gsap.to(intersectedPlane.material.uniforms.uMouse.value, { 
            x: e.clientX / window.innerWidth, 
            y: 1 - e.clientY / window.innerHeight, 
            duration: 0.3 
        });
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updatePlanePosition();
    renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const newFov = Math.atan((window.innerHeight / 2) / distance) * 2 * (180 / Math.PI);
    camera.fov = newFov;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updatePlanePosition();
});
