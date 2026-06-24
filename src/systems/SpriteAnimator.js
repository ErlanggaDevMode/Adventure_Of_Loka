import * as THREE from 'three';

export class SpriteAnimator {
  constructor(texture, cols, rows, fps = 12) {
    this.fps = fps;
    this.texture = texture;
    this.cols = cols;
    this.rows = rows;
    this.currentFrame = 0;
    this.totalFrames = cols * rows;
    this.elapsed = 0;

    this.initTexture();
  }

  initTexture() {
    if (this.texture) {
      this.texture.wrapS = THREE.RepeatWrapping;
      this.texture.wrapT = THREE.RepeatWrapping;
      this.texture.repeat.set(1 / this.cols, 1 / this.rows);
      this.updateOffset();
    }
  }

  setAnimation(texture, cols, rows, fps = this.fps) {
    this.texture = texture;
    this.cols = cols;
    this.rows = rows;
    this.fps = fps;
    this.totalFrames = cols * rows;
    this.reset();
    this.initTexture();
  }

  reset() {
    this.currentFrame = 0;
    this.elapsed = 0;
    this.updateOffset();
  }

  updateOffset() {
    if (!this.texture) return;
    const col = this.currentFrame % this.cols;
    const row = Math.floor(this.currentFrame / this.cols);
    // In Three.js, V coordinates start at the bottom, so (1 - (row + 1)/rows) shifts it correctly
    this.texture.offset.set(col / this.cols, 1 - (row + 1) / this.rows);
  }

  update(delta) {
    if (!this.texture || this.totalFrames <= 1) return;

    this.elapsed += delta;
    const frameTime = 1 / this.fps;

    if (this.elapsed >= frameTime) {
      const framesToAdvance = Math.floor(this.elapsed / frameTime);
      this.elapsed = this.elapsed % frameTime;
      this.currentFrame = (this.currentFrame + framesToAdvance) % this.totalFrames;
      this.updateOffset();
    }
  }
}
