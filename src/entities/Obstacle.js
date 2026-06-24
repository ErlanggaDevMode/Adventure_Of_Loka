import * as THREE from 'three';
import { CONFIG } from '../config/constants.js';

export class Obstacle {
  constructor(scene, x, type = 'LOW') {
    this.scene = scene;
    this.type = type;
    this.x = x;
    this.toRemove = false;

    // Dimensions based on type (scaled proportionally to the player size using CONFIG.PLAYER_SCALE)
    if (this.type === 'HIGH') {
      // High obstacle - player must SLIDE under it
      this.width = 1.0 * CONFIG.PLAYER_SCALE;
      this.height = 1.2 * CONFIG.PLAYER_SCALE;
      this.y = CONFIG.GROUND_Y + 1.2 * CONFIG.PLAYER_SCALE; // Suspended in the air
      this.color = 0x64748b; // cool slate gray
    } else {
      // Low obstacle - player must JUMP over it
      this.width = 1.0 * CONFIG.PLAYER_SCALE;
      this.height = 1.0 * CONFIG.PLAYER_SCALE;
      this.y = CONFIG.GROUND_Y; // On the ground
      this.color = 0x475569; // darker steel gray
    }

    // Visual Mesh creation (layer z = 3) with texture fallback support
    this.geometry = new THREE.PlaneGeometry(this.width, this.height);
    this.material = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      alphaTest: 0.05
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    // Position mesh (center Y = bottom Y + height/2)
    this.mesh.position.set(this.x, this.y + this.height / 2, 3);
    this.scene.add(this.mesh);

    this.texture = null;
    this.loadTexture();
  }

  loadTexture() {
    const loader = new THREE.TextureLoader();
    const index = this.type === 'HIGH' ? CONFIG.OBSTACLE_HIGH_TEXTURE_INDEX : CONFIG.OBSTACLE_LOW_TEXTURE_INDEX;
    const path = `/assets/texture/texture_16px ${index}.png`;

    loader.load(
      path,
      (texture) => {
        this.texture = texture;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter; // maintain sharp pixelated look
        texture.colorSpace = THREE.SRGBColorSpace;
        this.material.map = texture;
        this.material.needsUpdate = true;
      },
      undefined,
      () => {
        console.warn(`[WARN] Failed to load obstacle texture: ${path}, using color fallback`);
        this.material.color.setHex(this.type === 'HIGH' ? 0x64748b : 0x475569);
        this.material.needsUpdate = true;
      }
    );
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      bottom: this.y,
      top: this.y + this.height
    };
  }

  update(delta, worldSpeed) {
    // Move left
    this.x -= worldSpeed * delta;
    this.mesh.position.x = this.x;

    // Mark for removal if offscreen (left of player view)
    if (this.x < -15) {
      this.markForRemoval();
    }
  }

  markForRemoval() {
    this.toRemove = true;
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    if (this.texture) this.texture.dispose();
  }
}
