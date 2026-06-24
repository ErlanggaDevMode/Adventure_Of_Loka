import * as THREE from 'three';
import { CONFIG } from '../config/constants.js';
import { SpriteAnimator } from '../systems/SpriteAnimator.js';

export class Player {
  constructor(scene) {
    this.scene = scene;

    // Physics state
    this.x = -3.0; // Fixed X position (~20% of screen width)
    this.y = CONFIG.GROUND_Y; // Feet Y position
    this.velocityY = 0;
    this.isGrounded = true;

    // Hitbox dimensions
    this.baseHitboxWidth = 0.8 * CONFIG.PLAYER_SCALE;
    this.baseHitboxHeight = 1.6 * CONFIG.PLAYER_SCALE;
    this.hitboxWidth = this.baseHitboxWidth;
    this.hitboxHeight = this.baseHitboxHeight;

    // Attack details
    this.attackActive = false;
    this.attackTimer = 0;

    // Game state machine
    // States: 'RUNNING', 'JUMPING', 'SLIDING', 'ATTACKING'
    this.state = 'RUNNING';
    this.slideTimer = 0;

    // Visual dimensions
    this.visualHeight = 1.8 * CONFIG.PLAYER_SCALE;
    this.visualWidth = 1.8 * CONFIG.PLAYER_SCALE;

    // Create 3D representation
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      alphaTest: 0.05
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(this.x, this.y + this.visualHeight / 2, 4); // layer z = 4
    this.scene.add(this.mesh);

    // Texture loading & fallback handling
    this.textures = {
      idle: null,
      run: null,
      slide: null,
      attack: null
    };
    this.loadTextures();

    // Sprite Animator
    this.animator = null;
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();

    // Helper to handle error
    const handleLoadError = (name) => {
      console.warn(`[WARN] Asset ${name}.png not found, using placeholder`);
      this.usePlaceholderStyle();
    };

    // Load Idle
    loader.load(
      '/assets/sprites/idle.png',
      (texture) => {
        this.textures.idle = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        if (this.state === 'RUNNING' && !this.textures.run) {
          this.setAnimationState('idle');
        }
      },
      undefined,
      () => handleLoadError('idle')
    );

    // Load Run
    loader.load(
      '/assets/sprites/run.png',
      (texture) => {
        this.textures.run = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        if (this.state === 'RUNNING' || this.state === 'JUMPING') {
          this.setAnimationState('run');
        }
      },
      undefined,
      () => handleLoadError('run')
    );

    // Load Slide
    loader.load(
      '/assets/sprites/slide.png',
      (texture) => {
        this.textures.slide = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        if (this.state === 'SLIDING') {
          this.setAnimationState('slide');
        }
      },
      undefined,
      () => handleLoadError('slide')
    );

    // Load Attack
    loader.load(
      '/assets/sprites/attack.png',
      (texture) => {
        this.textures.attack = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        if (this.state === 'ATTACKING') {
          this.setAnimationState('attack');
        }
      },
      undefined,
      () => handleLoadError('attack')
    );
  }

  usePlaceholderStyle() {
    // Green placeholder box style if textures aren't available
    if (!this.textures.idle && !this.textures.run && !this.textures.slide && !this.textures.attack) {
      this.material.map = null;
      this.material.color.setHex(0x10B981); // beautiful emerald green
      this.material.needsUpdate = true;
      this.visualWidth = 1.2 * CONFIG.PLAYER_SCALE;
      this.visualHeight = 1.8 * CONFIG.PLAYER_SCALE;
      this.mesh.scale.set(this.visualWidth, this.visualHeight, 1);
    }
  }

  setAnimationState(animName) {
    const texture = this.textures[animName];
    if (!texture) {
      this.usePlaceholderStyle();
      return;
    }

    this.material.map = texture;
    this.material.color.setHex(0xffffff);
    this.material.needsUpdate = true;

    let cols = 1;
    let rows = 1;

    if (animName === 'idle') {
      cols = CONFIG.PLAYER_IDLE_COLS;
      rows = CONFIG.PLAYER_IDLE_ROWS;
    } else if (animName === 'run') {
      cols = CONFIG.PLAYER_RUN_COLS;
      rows = CONFIG.PLAYER_RUN_ROWS;
    } else if (animName === 'slide') {
      cols = CONFIG.PLAYER_SLIDE_COLS;
      rows = CONFIG.PLAYER_SLIDE_ROWS;
    } else if (animName === 'attack') {
      cols = CONFIG.PLAYER_ATTACK_COLS;
      rows = CONFIG.PLAYER_ATTACK_ROWS;
    }

    this.animator = new SpriteAnimator(
      texture,
      cols,
      rows,
      CONFIG.PLAYER_ANIM_FPS
    );

    // Calculate aspect ratio dynamically based on image dimensions and grid configuration
    if (texture.image && texture.image.width > 0 && texture.image.height > 0) {
      const frameWidth = texture.image.width / cols;
      const frameHeight = texture.image.height / rows;
      this.visualWidth = this.visualHeight * (frameWidth / frameHeight);
    } else {
      // Safe fallback aspect ratio
      this.visualWidth = this.visualHeight * 1.6;
    }

    this.mesh.scale.set(this.visualWidth, this.visualHeight, 1);
  }

  setState(newState) {
    if (this.state === newState) return;

    this.state = newState;

    switch (newState) {
      case 'RUNNING':
        this.hitboxHeight = this.baseHitboxHeight;
        this.attackActive = false;
        this.setAnimationState('run');
        break;

      case 'JUMPING':
        this.hitboxHeight = this.baseHitboxHeight;
        this.isGrounded = false;
        // Keep run animation or switch to a jump frame
        this.setAnimationState('run');
        break;

      case 'SLIDING':
        // Hitbox height is reduced to 45% (gives better headroom clearance)
        this.hitboxHeight = this.baseHitboxHeight * 0.45;
        this.slideTimer = 0;
        this.attackActive = false;
        this.setAnimationState('slide');
        break;

      case 'ATTACKING':
        this.hitboxHeight = this.baseHitboxHeight;
        this.attackActive = true;
        this.attackTimer = 0;
        this.setAnimationState('attack');
        break;
    }
  }

  getBounds() {
    // Returns AABB box values based on feet-anchored Y position
    return {
      left: this.x - this.hitboxWidth / 2,
      right: this.x + this.hitboxWidth / 2,
      bottom: this.y,
      top: this.y + this.hitboxHeight
    };
  }

  getAttackBounds() {
    if (!this.attackActive) return null;
    return {
      left: this.x + this.hitboxWidth / 2,
      right: this.x + this.hitboxWidth / 2 + CONFIG.ATTACK_HITBOX_WIDTH,
      bottom: this.y,
      top: this.y + this.hitboxHeight
    };
  }

  reset() {
    this.y = CONFIG.GROUND_Y;
    this.velocityY = 0;
    this.isGrounded = true;
    this.hitboxHeight = this.baseHitboxHeight;
    this.attackActive = false;
    this.setState('RUNNING');
    if (this.animator) this.animator.reset();
  }

  update(delta, inputHandler) {
    // 1. Resolve State Transitions & Inputs
    switch (this.state) {
      case 'RUNNING':
        if (inputHandler.isJumpPressed()) {
          this.velocityY = CONFIG.JUMP_FORCE;
          this.setState('JUMPING');
        } else if (inputHandler.isSlideHeld()) {
          this.setState('SLIDING');
        } else if (inputHandler.isAttackPressed()) {
          this.setState('ATTACKING');
        }
        break;

      case 'JUMPING':
        // Physics handles gravity and ground landing
        break;

      case 'SLIDING':
        this.slideTimer += delta * 1000;
        // Revert when timer finishes OR when key is released
        if (this.slideTimer >= CONFIG.SLIDE_DURATION || !inputHandler.isSlideHeld()) {
          this.setState('RUNNING');
        }
        break;

      case 'ATTACKING':
        this.attackTimer += delta * 1000;
        if (this.attackTimer >= CONFIG.ATTACK_HITBOX_DURATION) {
          this.setState('RUNNING');
        }
        break;
    }

    // 2. Apply Manual Physics (Gravity & Movement)
    if (!this.isGrounded) {
      this.velocityY += CONFIG.GRAVITY * delta;
      this.y += this.velocityY * delta;

      // Ground Detection
      if (this.y <= CONFIG.GROUND_Y) {
        this.y = CONFIG.GROUND_Y;
        this.velocityY = 0;
        this.isGrounded = true;
        if (this.state === 'JUMPING') {
          this.setState('RUNNING');
        }
      }
    }

    // 3. Update Visual Representation
    if (this.state === 'SLIDING') {
      // Compress height slightly to 80% to fit the slide visual crouch better
      this.mesh.scale.set(this.visualWidth, this.visualHeight * 0.8, 1);
      // Offset mesh so feet stay on the ground
      this.mesh.position.set(this.x, this.y + (this.visualHeight * 0.8) / 2, 4);
    } else {
      this.mesh.scale.set(this.visualWidth, this.visualHeight, 1);
      this.mesh.position.set(this.x, this.y + this.visualHeight / 2, 4);
    }

    // 4. Tick Sprite Animation
    if (this.animator) {
      this.animator.update(delta);
    }
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    if (this.textures.idle) this.textures.idle.dispose();
    if (this.textures.run) this.textures.run.dispose();
    if (this.textures.slide) this.textures.slide.dispose();
    if (this.textures.attack) this.textures.attack.dispose();
  }
}
