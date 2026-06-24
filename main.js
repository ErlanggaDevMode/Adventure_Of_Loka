import * as THREE from 'three';
import { Game } from './src/core/Game.js';

// Setup Three.js Scene
const scene = new THREE.Scene();

// Orthographic Camera (ideal for 2D side-scrollers)
const aspect = window.innerWidth / window.innerHeight;
const frustumHeight = 10; // World units high
const camera = new THREE.OrthographicCamera(
  -frustumHeight * aspect / 2,
   frustumHeight * aspect / 2,
   frustumHeight / 2,
  -frustumHeight / 2,
  0.1,
  1000
);
camera.position.set(0, 0, 10);

// Renderer setup pointing to our index.html canvas
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Handle Resize
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const newAspect = width / height;

  camera.left = -frustumHeight * newAspect / 2;
  camera.right = frustumHeight * newAspect / 2;
  camera.top = frustumHeight / 2;
  camera.bottom = -frustumHeight / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Initialize the game
const game = new Game(scene, camera, renderer);
game.init();
