import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * axes helper
 */
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper)

//Variables
const parameters = {}
parameters.particlesCount = 2000;
parameters.particlesSize = 0.02;
parameters.branches = 3;
parameters.radius = 5;
parameters.spin = 1;
parameters.randomness = 1;
parameters.randomnessPower = 1;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';

let particlesGeometry = null;
let particlesMaterial = null;
let points = null;


const generateGalaxy = () => {
    if(points !== null) {
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        scene.remove(points)
    }
    /**
     * Geometry
     */
     particlesGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.particlesCount * 3);
    const colors = new Float32Array(parameters.particlesCount * 3);
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);


    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    for(let i = 0; i < parameters.particlesCount; i ++) {
        const i3 = i * 3;
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchesAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        const randomness = Math.random() < 0.5 ? 1 : -1;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * randomness
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * randomness
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * randomness
        positions[i3]     = Math.cos(branchesAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ

        //Colors
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius)
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }


    /**
     * Material
     */
     particlesMaterial = new THREE.PointsMaterial({
        size: parameters.particlesSize,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
         vertexColors: true
    })

    /**
     * Point
     */
     points = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(points)
}

generateGalaxy();


gui.add(parameters, 'particlesCount').min(10).max(10000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'particlesSize').min(0.02).max(.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(1).max(10).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(10).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(.1).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(.01).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
