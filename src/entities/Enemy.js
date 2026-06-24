import * as THREE from 'three';
import { CONFIG } from '../config/constants.js';

// Cache to store textures across all spawned enemies to avoid constant reload requests
const enemyTexturesCache = {
  idle: [],
  death: []
};

let texturesLoadingPromise = null;

function loadEnemyTextures() {
  if (texturesLoadingPromise) return texturesLoadingPromise;

  const loader = new THREE.TextureLoader();
  const promises = [];

  // Load 8 Idle frames
  for (let i = 1; i <= 8; i++) {
    promises.push(
      new Promise((resolve) => {
        const path = `/assets/sprites/enemy/Idle/Bringer-of-Death_Idle_${i}.png`;
        loader.load(
          path,
          (tex) => {
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            tex.colorSpace = THREE.SRGBColorSpace;
            enemyTexturesCache.idle[i - 1] = tex;
            resolve();
          },
          undefined,
          () => {
            console.warn(`Failed to load idle frame: ${path}`);
            resolve();
          }
        );
      })
    );
  }

  // Load 10 Death frames
  for (let i = 1; i <= 10; i++) {
    promises.push(
      new Promise((resolve) => {
        const path = `/assets/sprites/enemy/Death/Bringer-of-Death_Death_${i}.png`;
        loader.load(
          path,
          (tex) => {
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            tex.colorSpace = THREE.SRGBColorSpace;
            enemyTexturesCache.death[i - 1] = tex;
            resolve();
          },
          undefined,
          () => {
            console.warn(`Failed to load death frame: ${path}`);
            resolve();
          }
        );
      })
    );
  }

  texturesLoadingPromise = Promise.all(promises);
  return texturesLoadingPromise;
}

export class Enemy {
  constructor(scene, x) {
    this.scene = scene;
    this.x = x;

    // Float the enemy slightly above the ground (lowered to 0.15 units above ground)
    this.y = CONFIG.GROUND_Y + 0.25;

    // Scale enemy size dynamically based on CONFIG.ENEMY_SCALE
    this.height = 1.5 * CONFIG.ENEMY_SCALE;
    this.width = 2.25 * CONFIG.ENEMY_SCALE;

    // Hitbox tuning (tighten hitbox to actual pixel boundaries, excluding empty frame padding)
    this.hitboxWidth = this.width * 0.5; // 50% of visual width
    this.hitboxHeight = this.height * 0.75; // 75% of visual height

    this.canBeAttacked = true;
    this.toRemove = false;
    this.dead = false;

    // States: 'ALIVE', 'DYING'
    this.state = 'ALIVE';

    // Animation frames indices
    this.currentFrame = 0;
    this.animTimer = 0;

    // Float micro-animation state
    this.floatTimer = Math.random() * Math.PI * 2; // randomize start phase

    // Visual Mesh creation (layer z = 3)
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

    // Proactively start static texturing
    loadEnemyTextures().then(() => {
      this.updateTextureMap();
    });
  }

  updateTextureMap() {
    if (this.toRemove) return;

    let textures = [];
    if (this.state === 'ALIVE') {
      textures = enemyTexturesCache.idle;
    } else if (this.state === 'DYING') {
      textures = enemyTexturesCache.death;
    }

    if (textures.length > 0) {
      const tex = textures[this.currentFrame % textures.length];
      if (tex) {
        this.material.map = tex;
        this.material.color.setHex(0xffffff); // reset back to standard coloring
        this.material.needsUpdate = true;
      }
    } else {
      // Fallback solid coloring if textures fail loading
      this.material.map = null;
      this.material.color.setHex(0xef4444); // vibrant red placeholder
      this.material.needsUpdate = true;
    }
  }

  getBounds() {
    // Return bounds based on the custom tight hitbox limits
    return {
      left: this.x - this.hitboxWidth / 2,
      right: this.x + this.hitboxWidth / 2,
      bottom: this.y,
      top: this.y + this.hitboxHeight
    };
  }

  update(delta, worldSpeed) {
    if (this.state === 'ALIVE') {
      // Move left at normal speed
      this.x -= worldSpeed * delta;
      this.mesh.position.x = this.x;

      // Floating wraith hover effect (naik-turun)
      this.floatTimer += delta * 3; // speed of floating
      const floatOffset = Math.sin(this.floatTimer) * 0.12; // amplitude of float
      this.mesh.position.y = this.y + this.height / 2 + floatOffset;

      // Animate Idle frames loop
      this.animTimer += delta;
      const frameTime = 1 / CONFIG.ENEMY_ANIM_FPS;
      if (this.animTimer >= frameTime) {
        this.animTimer = 0;
        this.currentFrame = (this.currentFrame + 1) % 8;
        this.updateTextureMap();
      }
    } else if (this.state === 'DYING') {
      // Slow down to a drift during death animation
      this.x -= worldSpeed * 0.1 * delta;
      this.mesh.position.x = this.x;

      // Floating remains slightly slower during death sequence
      this.floatTimer += delta * 1;
      const floatOffset = Math.sin(this.floatTimer) * 0.05;
      this.mesh.position.y = this.y + this.height / 2 + floatOffset;

      // Animate Death frames once
      this.animTimer += delta;
      const frameTime = 1 / CONFIG.ENEMY_ANIM_FPS;
      if (this.animTimer >= frameTime) {
        this.animTimer = 0;
        this.currentFrame++;
        if (this.currentFrame >= 10) {
          // Remove from game once death sequence finishes
          this.toRemove = true;
        } else {
          this.updateTextureMap();
        }
      }
    }

    // Mark for removal if offscreen
    if (this.x < -15) {
      this.markForRemoval();
    }
  }

  takeDamage() {
    if (this.state === 'DYING') return;

    this.dead = true;
    this.state = 'DYING';
    this.canBeAttacked = false; // cannot hit it again
    this.currentFrame = 0;
    this.animTimer = 0;
    this.updateTextureMap();
  }

  isDead() {
    return this.dead;
  }

  markForRemoval() {
    this.toRemove = true;
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}
