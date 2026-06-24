export class GameLoop {
  constructor(updateCallback, renderCallback) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
    this.lastTime = 0;
    this.maxDelta = 0.1; // Cap delta to prevent massive jumps/clips during lag
    this.running = false;
    this.rafId = null;

    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick(timestamp) {
    if (!this.running) return;

    let delta = (timestamp - this.lastTime) / 1000; // in seconds
    this.lastTime = timestamp;

    // Cap delta to prevent physics glitches if browser loses focus
    if (delta > this.maxDelta) {
      delta = this.maxDelta;
    }

    this.updateCallback(delta);
    this.renderCallback();

    this.rafId = requestAnimationFrame(this.tick);
  }
}
