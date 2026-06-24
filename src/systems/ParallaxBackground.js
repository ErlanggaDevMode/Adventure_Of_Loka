import * as THREE from 'three';
import { CONFIG } from '../config/constants.js';

export class ParallaxBackground {
  constructor(scene) {
    this.scene = scene;

    // Progressive speed multipliers from back (Layer 11) to front (Layer 0)
    this.bgSpeedMultipliers = [
      0.01, // Layer_0011_0.png (furthest back sky layer)
      0.03, // Layer_0010_1.png
      0.06, // Layer_0009_2.png
      0.10, // Layer_0008_3.png
      0.10, // Layer_0007_Lights.png
      0.15, // Layer_0006_4.png
      0.22, // Layer_0005_5.png
      0.22, // Layer_0004_Lights.png
      0.32, // Layer_0003_6.png
      0.45, // Layer_0002_7.png
      0.60, // Layer_0001_8.png
      0.80  // Layer_0000_9.png (foreground background layer)
    ];

    this.bgFilenames = [
      'Layer_0011_0.png',
      'Layer_0010_1.png',
      'Layer_0009_2.png',
      'Layer_0008_3.png',
      'Layer_0007_Lights.png',
      'Layer_0006_4.png',
      'Layer_0005_5.png',
      'Layer_0004_Lights.png',
      'Layer_0003_6.png',
      'Layer_0002_7.png',
      'Layer_0001_8.png',
      'Layer_0000_9.png'
    ];

    // Background layers array to hold loaded assets
    this.bgLayers = []; // items: { mesh, texture, speedMultiplier }

    // Ground layer group
    this.groundLayer = { group: new THREE.Group(), hasTexture: false, texture: null };
    this.scene.add(this.groundLayer.group);

    // Procedural entities arrays (for fallback)
    this.proceduralGroundStripes = [];
    this.groundBaseMesh = null;

    // Load textures
    this.loadTextures();
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();

    // 1. Load Background Layers
    this.bgFilenames.forEach((filename, index) => {
      const path = `/assets/Background layers/${filename}`;
      const speedMultiplier = this.bgSpeedMultipliers[index];

      loader.load(
        path,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(2, 1); // Tile horizontally
          texture.colorSpace = THREE.SRGBColorSpace;

          // Background plane to cover viewport (frustum height is 10)
          const geom = new THREE.PlaneGeometry(30, 10);
          const mat = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            alphaTest: 0.005
          });
          const mesh = new THREE.Mesh(geom, mat);
          
          // Layer depth (Z-index from 0.0 to 1.1)
          const zPos = index * 0.1;
          mesh.position.set(0, 0, zPos);
          this.scene.add(mesh);

          this.bgLayers.push({
            mesh,
            texture,
            speedMultiplier
          });
          console.log(`Loaded background layer: ${filename}`);
        },
        undefined,
        () => {
          console.warn(`[WARN] Failed to load background layer: ${filename}`);
        }
      );
    });

    // 2. Load Ground Tile Texture
    const groundTilePath = `/assets/texture/texture_16px ${CONFIG.GROUND_TEXTURE_INDEX}.png`;
    loader.load(
      groundTilePath,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        // Ground width is 40 units, height is 4 units.
        // Tilings setting: repeat 40 times horizontally, 4 times vertically.
        texture.repeat.set(40, 4);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter; // keep crisp pixelated art look
        texture.colorSpace = THREE.SRGBColorSpace;

        const height = 4;
        const geom = new THREE.PlaneGeometry(40, height);
        const mat = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geom, mat);
        
        // Center position of ground Y = GROUND_Y - height/2, Z = 2
        mesh.position.set(0, CONFIG.GROUND_Y - height / 2, 2.0); 
        this.groundLayer.group.add(mesh);

        this.groundLayer.hasTexture = true;
        this.groundLayer.texture = texture;
        console.log(`Loaded ground tile texture: ${groundTilePath}`);
      },
      undefined,
      () => {
        console.warn(`[WARN] Failed to load ground tile texture: ${groundTilePath}, building procedural ground layer`);
        this.buildProceduralGround();
      }
    );
  }

  buildProceduralGround() {
    // 1. Core Solid Ground
    const groundHeight = 5;
    const geom = new THREE.PlaneGeometry(50, groundHeight);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x020617 // very dark blue-grey
    });
    this.groundBaseMesh = new THREE.Mesh(geom, mat);
    this.groundBaseMesh.position.set(0, CONFIG.GROUND_Y - groundHeight / 2, 2); // z = 2
    this.groundLayer.group.add(this.groundBaseMesh);

    // 2. Scrolling road stripes
    const stripeCount = 6;
    const stripeSpacing = 9;
    for (let i = 0; i < stripeCount; i++) {
      const w = 2.0;
      const h = 0.15;
      const sGeom = new THREE.PlaneGeometry(w, h);
      const sMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8
      });
      const mesh = new THREE.Mesh(sGeom, sMat);
      
      const x = -25 + i * stripeSpacing;
      const y = CONFIG.GROUND_Y - 0.5;
      mesh.position.set(x, y, 2.1); // z = 2.1

      this.groundLayer.group.add(mesh);
      this.proceduralGroundStripes.push({ mesh, width: w, spacing: stripeSpacing });
    }
  }

  update(delta, worldSpeed) {
    // Scroll background layers
    this.bgLayers.forEach((layer) => {
      if (layer.texture) {
        layer.texture.offset.x += worldSpeed * layer.speedMultiplier * delta * 0.05;
      }
    });

    // Scroll ground texture (speed multiplier = 1.0)
    if (this.groundLayer.hasTexture && this.groundLayer.texture) {
      this.groundLayer.texture.offset.x += worldSpeed * 1.0 * delta * 0.05;
    }

    // Scroll ground stripes fallback
    if (!this.groundLayer.hasTexture && this.proceduralGroundStripes) {
      const wrapLeftLimit = -25;
      const groundSpeed = worldSpeed * 1.0;
      this.proceduralGroundStripes.forEach((stripe) => {
        stripe.mesh.position.x -= groundSpeed * delta;
        if (stripe.mesh.position.x < wrapLeftLimit) {
          stripe.mesh.position.x += stripe.spacing * this.proceduralGroundStripes.length;
        }
      });
    }
  }

  destroy() {
    // Dispose background layers
    this.bgLayers.forEach((layer) => {
      this.scene.remove(layer.mesh);
      if (layer.mesh.geometry) layer.mesh.geometry.dispose();
      if (layer.mesh.material) layer.mesh.material.dispose();
      if (layer.texture) layer.texture.dispose();
    });

    // Dispose ground layers
    this.scene.remove(this.groundLayer.group);
    this.groundLayer.group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    if (this.groundLayer.texture) this.groundLayer.texture.dispose();
  }
}
