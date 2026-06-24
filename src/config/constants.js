export const CONFIG = {
  // World Settings
  WORLD_SPEED_BASE: 5,          // world units per second
  WORLD_SPEED_INCREMENT: 0.2,   // speed added every 10 seconds
  GRAVITY: -34,                 // downward force (adjusted for snappier jump feel)

  // Player Settings
  PLAYER_SCALE: 1.5,            // scale factor: 1.5 for 1.5x larger, 2.0 for 2x larger, etc.
  JUMP_FORCE: 16,               // upward impulse force
  SLIDE_DURATION: 700,          // milliseconds
  ATTACK_HITBOX_WIDTH: 1.5,     // range in front of player
  ATTACK_HITBOX_DURATION: 583,  // milliseconds (aligns with 7 frames at 12 FPS)
  GROUND_Y: -2.5,               // Y position representing the ground floor

  // Spawn Settings
  SPAWN_MIN_INTERVAL: 1500,     // milliseconds
  SPAWN_MAX_INTERVAL: 3000,     // milliseconds
  SPAWN_OBSTACLE_CHANCE: 0.6,   // 60% chance obstacle, 40% chance enemy

  // Scoring
  SCORE_PER_SECOND: 1,
  SCORE_PER_KILL: 10,
  SCORE_PER_AVOID: 5,

  // Spritesheet Layouts (configured for actual PNGs: 640x80 for idle, 768x80 for run, 896x80 for attack, 640x80 for slide)
  PLAYER_IDLE_COLS: 5,
  PLAYER_IDLE_ROWS: 1,
  PLAYER_RUN_COLS: 6,
  PLAYER_RUN_ROWS: 1,
  PLAYER_SLIDE_COLS: 5,
  PLAYER_SLIDE_ROWS: 1,
  PLAYER_ATTACK_COLS: 7,
  PLAYER_ATTACK_ROWS: 1,
  PLAYER_ANIM_FPS: 14,

  // Ground and Obstacle Texture Indices (refers to assets/texture/texture_16px <num>.png)
  GROUND_TEXTURE_INDEX: 40,
  OBSTACLE_LOW_TEXTURE_INDEX: 265,
  OBSTACLE_HIGH_TEXTURE_INDEX: 265,

  // Enemy settings
  ENEMY_SCALE: 1.5,
  ENEMY_ANIM_FPS: 10,
};
