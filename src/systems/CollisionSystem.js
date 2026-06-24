export class CollisionSystem {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  checkAABB(rectA, rectB) {
    return (
      rectA.left < rectB.right &&
      rectA.right > rectB.left &&
      rectA.bottom < rectB.top &&
      rectA.top > rectB.bottom
    );
  }

  checkCollisions(player, entities) {
    const playerBounds = player.getBounds();
    const attackBounds = player.getAttackBounds(); // null if not active

    entities.forEach((entity) => {
      // 1. Check Avoidance (if entity passes player X and wasn't hit or avoided yet)
      if (entity.x < player.x && !entity.avoided && !entity.toRemove) {
        entity.avoided = true;
        if (!entity.canBeAttacked) {
          this.emit('obstacleAvoided');
        }
      }

      // Skip collision if entity is already flagged for removal
      if (entity.toRemove) return;

      // 2. Check Player Attack Hitbox vs Enemy
      if (attackBounds && entity.canBeAttacked) {
        const entityBounds = entity.getBounds();
        if (this.checkAABB(attackBounds, entityBounds)) {
          entity.takeDamage();
          this.emit('enemyKilled');
          return; // Skip standard body hit check
        }
      }

      // 3. Check Player Body vs Obstacle or Enemy (ignore body collisions if enemy is already dead)
      if (entity.isDead && entity.isDead()) return;

      const entityBounds = entity.getBounds();
      if (this.checkAABB(playerBounds, entityBounds)) {
        this.emit('playerHit');
      }
    });
  }

  reset() {
    // Clear listeners or state if needed, though they usually persist across games
  }
}
