import { CONFIG } from '../config/constants.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Enemy } from '../entities/Enemy.js';

export class SpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.entities = [];
    this.spawnTimer = 0;
    this.nextSpawnTime = this.calculateNextSpawnTime(0);
  }

  calculateNextSpawnTime(score) {
    // Difficulty Scaling: decrease spawn intervals after score > 100
    const scalingFactor = score > 100 ? 0.75 : 1.0;
    const min = CONFIG.SPAWN_MIN_INTERVAL * scalingFactor;
    const max = CONFIG.SPAWN_MAX_INTERVAL * scalingFactor;
    return min + Math.random() * (max - min);
  }

  spawn(score) {
    const spawnX = 12.0; // Spawns offscreen to the right
    const isObstacle = Math.random() < CONFIG.SPAWN_OBSTACLE_CHANCE;

    if (isObstacle) {
      // 50% chance for LOW barricade, 50% chance for HIGH suspended obstacle
      const type = Math.random() < 0.5 ? 'LOW' : 'HIGH';
      const obstacle = new Obstacle(this.scene, spawnX, type);
      this.entities.push(obstacle);
    } else {
      const enemy = new Enemy(this.scene, spawnX);
      this.entities.push(enemy);
    }
  }

  update(delta, worldSpeed, score) {
    // 1. Tick Spawn Timer
    this.spawnTimer += delta * 1000; // convert to ms
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.spawn(score);
      this.spawnTimer = 0;
      this.nextSpawnTime = this.calculateNextSpawnTime(score);
    }

    // 2. Update all active entities and filter out offscreen/dead ones
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      entity.update(delta, worldSpeed);

      if (entity.toRemove) {
        entity.destroy();
        this.entities.splice(i, 1);
      }
    }
  }

  clearAll() {
    this.entities.forEach((entity) => entity.destroy());
    this.entities = [];
    this.spawnTimer = 0;
    this.nextSpawnTime = this.calculateNextSpawnTime(0);
  }

  reset() {
    this.clearAll();
  }
}
