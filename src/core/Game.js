import { CONFIG } from '../config/constants.js';
import { InputHandler } from './InputHandler.js';
import { GameLoop } from './GameLoop.js';
import { Player } from '../entities/Player.js';
import { ParallaxBackground } from '../systems/ParallaxBackground.js';
import { SpawnManager } from '../systems/SpawnManager.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { HUD } from '../ui/HUD.js';
import { StartScreen } from '../ui/StartScreen.js';
import { GameOverScreen } from '../ui/GameOverScreen.js';

export class Game {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Game state
    // States: 'START', 'PLAYING', 'GAMEOVER'
    this.state = 'START';
    this.worldSpeed = CONFIG.WORLD_SPEED_BASE;
    this.worldSpeedTimer = 0;

    // UI mount point
    this.uiContainer = document.getElementById('ui-container');
  }

  init() {
    // 1. Initialize logic systems
    this.inputHandler = new InputHandler();
    this.collisionSystem = new CollisionSystem();
    this.scoreSystem = new ScoreSystem(this.collisionSystem);

    // 2. Initialize visual entities and backgrounds
    this.player = new Player(this.scene);
    this.parallaxBackground = new ParallaxBackground(this.scene);
    this.spawnManager = new SpawnManager(this.scene);

    // 3. Initialize HTML overlays (DOM UI)
    this.hud = new HUD(this.uiContainer, this.scoreSystem);
    this.startScreen = new StartScreen(this.uiContainer, () => this.start());
    this.gameOverScreen = new GameOverScreen(this.uiContainer, () => this.restart());

    // 4. Bind hit detection to trigger game over
    this.collisionSystem.on('playerHit', () => {
      this.gameOver();
    });

    // 5. Initialize loop manager
    this.gameLoop = new GameLoop(
      (delta) => this.update(delta),
      () => this.render()
    );

    // 6. Present Start Screen and kick off loop
    this.startScreen.show();
    this.hud.hide();
    this.gameOverScreen.hide();
    
    // Player starts with idle state in start screen
    this.player.setState('RUNNING'); // set to running to kick off loading and loop
    this.player.setState('RUNNING'); // wait, run is default. We set to RUNNING/idle.
    this.player.setState('RUNNING'); // will update animation according to state later

    this.gameLoop.start();
  }

  start() {
    this.state = 'PLAYING';
    this.startScreen.hide();
    this.hud.show();
    this.worldSpeed = CONFIG.WORLD_SPEED_BASE;
    this.worldSpeedTimer = 0;
    this.scoreSystem.reset();
    this.player.reset();
    this.spawnManager.reset();
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.hud.hide();
    this.gameOverScreen.show(this.scoreSystem.getScore(), this.scoreSystem.getHighScore());
  }

  restart() {
    this.gameOverScreen.hide();
    this.start();
  }

  update(delta) {
    if (this.state === 'START') {
      // Background slides slowly, player plays idle animation
      this.player.setState('RUNNING'); // ensures run texture loads
      // Listen for Space directly to start the game
      if (this.inputHandler.isJumpPressed()) {
        this.start();
        return;
      }
      this.player.update(delta, this.inputHandler);
      this.parallaxBackground.update(delta, 1.0); // slow scroll
    } 
    else if (this.state === 'PLAYING') {
      // 1. Difficulty Scaling: increment speed every 10 seconds
      this.worldSpeedTimer += delta;
      if (this.worldSpeedTimer >= 10.0) {
        this.worldSpeed += CONFIG.WORLD_SPEED_INCREMENT;
        this.worldSpeedTimer -= 10.0;
        console.log(`World speed increased to: ${this.worldSpeed.toFixed(2)}`);
      }

      // 2. Update entities & spawner
      this.player.update(delta, this.inputHandler);
      this.spawnManager.update(delta, this.worldSpeed, this.scoreSystem.getScore());
      
      // 3. Resolve collisions
      this.collisionSystem.checkCollisions(this.player, this.spawnManager.entities);

      // 4. Update core systems
      this.scoreSystem.update(delta);
      this.parallaxBackground.update(delta, this.worldSpeed);
      this.hud.update();
    }
    else if (this.state === 'GAMEOVER') {
      // Freeze everything
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.gameLoop.stop();
    this.inputHandler.destroy();
    this.player.destroy();
    this.parallaxBackground.destroy();
    this.spawnManager.clearAll();
  }
}
