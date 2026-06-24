import { CONFIG } from '../config/constants.js';

export class ScoreSystem {
  constructor(collisionSystem) {
    this.collisionSystem = collisionSystem;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.timeAccumulator = 0;

    // Listen to collision system events
    this.collisionSystem.on('enemyKilled', () => {
      this.addScore(CONFIG.SCORE_PER_KILL);
    });

    this.collisionSystem.on('obstacleAvoided', () => {
      this.addScore(CONFIG.SCORE_PER_AVOID);
    });
  }

  addScore(amount) {
    this.score += amount;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore(this.highScore);
    }
  }

  update(delta) {
    // Increment score by 1 every second
    this.timeAccumulator += delta;
    if (this.timeAccumulator >= 1.0) {
      const secondsPassed = Math.floor(this.timeAccumulator);
      this.timeAccumulator -= secondsPassed;
      this.addScore(secondsPassed * CONFIG.SCORE_PER_SECOND);
    }
  }

  getScore() {
    return this.score;
  }

  getHighScore() {
    return this.highScore;
  }

  loadHighScore() {
    try {
      const stored = localStorage.getItem('urban_endless_runner_highscore');
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch (e) {
      console.warn('Unable to access localStorage for high score');
      return 0;
    }
  }

  saveHighScore(score) {
    try {
      localStorage.setItem('urban_endless_runner_highscore', score.toString());
    } catch (e) {
      console.warn('Unable to save high score to localStorage');
    }
  }

  reset() {
    this.score = 0;
    this.timeAccumulator = 0;
  }
}
