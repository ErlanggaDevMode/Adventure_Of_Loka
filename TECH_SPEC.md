# TECH_SPEC.md — Technical Specification
**Project:** Adventure Of Loka  
**Stack:** Three.js + Vanilla JavaScript  
**Target:** Web Browser (Chrome, Firefox, Edge, Safari)

---

## 1. Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Renderer | Three.js | r165+ |
| Bahasa | Vanilla JavaScript (ES Modules) | ES2022 |
| Build Tool | Vite | 5.x |
| Markup | HTML5 | — |
| Styling | CSS3 (minimal, hanya UI overlay) | — |

> **Kenapa Three.js?**  
> Three.js menyediakan WebGL renderer yang efisien untuk game 2D berbasis sprite. Kita gunakan mode **Orthographic Camera** agar tampak seperti 2D side-scroller, tapi tetap memanfaatkan pipeline WebGL untuk performa tinggi.

---

## 2. Arsitektur File

```
/Adventure_Of_Loka/
├── index.html                  # Entry point (Canvas + DOM UI Overlay container)
├── main.js                     # Bootstrap game + scene & camera init
├── vite.config.js              # Konfigurasi Vite dev server & build
├── PRD.md                      # Product Requirement Document
├── TECH_SPEC.md                # Spesifikasi teknis ini
├── README.md                   # Repositori guide
├── ASSET_GUIDE.md              # Panduan konfigurasi spritesheet
├── /src
│   ├── /core
│   │   ├── Game.js             # Game state machine (START, PLAYING, GAMEOVER)
│   │   ├── GameLoop.js         # requestAnimationFrame loop + delta time
│   │   └── InputHandler.js     # Keyboard listener (jump, slide, attack)
│   ├── /entities
│   │   ├── Player.js           # Karakter utama Loka — physics + animasi + state
│   │   ├── Obstacle.js         # Obstacle statis — spawn, move, texture
│   │   └── Enemy.js            # Musuh Bringer of Death — floating, combat, frame animations
│   ├── /systems
│   │   ├── SpriteAnimator.js   # Spritesheet 2D grid slicer + frame stepper
│   │   ├── SpawnManager.js     # Spawner scheduler untuk obstacle & musuh
│   │   ├── CollisionSystem.js  # AABB collision detection (attack hitbox & vulnerability filters)
│   │   ├── ScoreSystem.js      # Skor logic + event emit + localStorage high score
│   │   └── ParallaxBackground.js # 12-layer parallax background + textured ground
│   ├── /ui
│   │   ├── HUD.js              # Score overlay (HTML div di atas canvas)
│   │   ├── StartScreen.js      # Start screen UI
│   │   └── GameOverScreen.js   # Game over + skor + restart button
│   └── /config
│       └── constants.js        # Semua magic number & konfigurasi game terpusat
├── /assets
│   ├── /sprites
│   │   ├── idle.png            # Spritesheet 5-frame Loka idle
│   │   ├── run.png             # Spritesheet 6-frame Loka run
│   │   ├── slide.png           # Spritesheet 5-frame Loka slide
│   │   ├── attack.png          # Spritesheet 7-frame Loka attack
│   │   └── /enemy
│   │       ├── /Idle
│   │       │   └── Bringer-of-Death_Idle_1.png s.d. _8.png
│   │       └── /Death
│   │           └── Bringer-of-Death_Death_1.png s.d. _10.png
│   ├── /Background layers
│   │   └── Layer_0000_9.png s.d. Layer_0011_0.png (12 layers kota parallax)
│   └── /texture
│       └── texture_16px 40.png, texture_16px 265.png (aspal & obstacle tiles)
└── package.json
```

---

## 3. Scene Setup — Three.js

### Kamera
```js
// Orthographic camera — tampak 2D side-scroller dengan tinggi viewport 10 unit
const aspect = window.innerWidth / window.innerHeight;
const frustumHeight = 10;
const camera = new THREE.OrthographicCamera(
  -frustumHeight * aspect / 2,
   frustumHeight * aspect / 2,
   frustumHeight / 2,
  -frustumHeight / 2,
  0.1,
  1000
);
camera.position.set(0, 0, 10);
```

### Renderer
```js
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

### Layer (Z-Depth)
Sistem koordinat 3D disesuaikan sehingga layer bertumpuk dengan benar tanpa z-fighting:

| Layer | z-index | Isi | Keterangan |
|-------|---------|-----|------------|
| Background 12-Layers | z = 0.0 s.d 1.1 | Latar kota parallax progresif | Layer 11 paling belakang (0.0), Layer 0 paling depan (1.1) |
| Ground Tile | z = 2.0 | Aspal bertekstur | Posisi Y = CONFIG.GROUND_Y - height/2 |
| Ground Stripes | z = 2.1 | Garis jalan (fallback) | Hanya muncul jika tekstur ground gagal diload |
| Obstacles | z = 3.0 | Rintangan HIGH/LOW | Tekstur index 265 |
| Enemies | z = 3.0 | Bringer of Death | Wraith melayang di foreground |
| Player | z = 4.0 | Karakter Utama Loka | Selalu berada paling depan di atas musuh/obstacle |

---

## 4. SpriteAnimator — Spritesheet 2D Grid

`SpriteAnimator.js` menangani pemotongan tekstur spritesheet berbasis kolom dan baris. Mendukung transisi animasi instan dan scaling aspek rasio visual secara dinamis berdasarkan file gambar asli.

```js
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
    // Di Three.js, koordinat V dimulai dari bawah, sehingga (1 - (row + 1)/rows) menggeser ke baris yang sesuai
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
```

---

## 5. Physics & State Machine — Player (Loka)

Player dikendalikan secara manual menggunakan gaya gravitasi sederhana:

```js
// Gravity application
velocityY += GRAVITY * delta;
positionY += velocityY * delta;

// Ground bounds check
if (positionY <= GROUND_Y) {
  positionY = GROUND_Y;
  velocityY = 0;
  isGrounded = true;
}
```

### State Machine Player
Karakter Loka memiliki empat state utama:
- `RUNNING`: State lari standar. Menerima transisi ke `JUMPING` (Space/Up), `SLIDING` (Down/S), atau `ATTACKING` (Z/J/Click).
- `JUMPING`: Menerapkan impuls ke atas. Menggunakan animasi `run` yang dimodifikasi. Hanya kembali ke `RUNNING` setelah menyentuh tanah.
- `SLIDING`: Menurunkan tinggi hitbox menjadi **45% dari tinggi dasar** (`baseHitboxHeight * 0.45`). Visual karakter dideformasi menjadi **80% tinggi normal** (`visualHeight * 0.8`) dan diposisikan dengan offset agar kaki menempel ke tanah. State dibatalkan jika tombol slide dilepas atau setelah `SLIDE_DURATION` (700ms) terlampaui.
- `ATTACKING`: Mengaktifkan tebasan pedang dengan hitbox serangan aktif sepanjang `ATTACK_HITBOX_WIDTH` (1.5 unit) di depan player selama `ATTACK_HITBOX_DURATION` (583ms). Menggunakan animasi `attack` (7 frame).

---

## 6. Collision System & Hitbox Tuning

`CollisionSystem` mendeteksi tabrakan Axis-Aligned Bounding Box (AABB) dengan penyesuaian hitbox khusus untuk menghindari ketidakadilan akibat frame kosong (padding) pada asset:

```js
checkAABB(rectA, rectB) {
  return (
    rectA.left < rectB.right &&
    rectA.right > rectB.left &&
    rectA.bottom < rectB.top &&
    rectA.top > rectB.bottom
  );
}
```

### Penalaan Dimensi Hitbox
- **Player Body Hitbox**: Lebar = `0.8 * CONFIG.PLAYER_SCALE`, Tinggi = `1.6 * CONFIG.PLAYER_SCALE`. (Dipotong 45% tingginya saat SLIDING).
- **Player Attack Hitbox**: Aktif tepat di depan player dengan jangkauan lebar 1.5 unit dan tinggi sama dengan tinggi player.
- **Enemy Hitbox**: Karena asset memiliki pinggiran transparan yang tebal, hitbox Bringer of Death dipersempit secara ketat ke pusat visualnya:
  - Lebar Hitbox = `50% dari lebar visual` (`width * 0.5`)
  - Tinggi Hitbox = `75% dari tinggi visual` (`height * 0.75`)

### Filter Vulnerability & Combat Flow
- Jika player berada dalam state `ATTACKING` dan ada musuh di dalam `Player Attack Hitbox`, musuh akan menerima damage (`enemy.takeDamage()`) dan mati. Pemain mendapat bonus kill score.
- Ketika musuh menerima damage, state musuh beralih ke `DYING`.
- Di dalam pengecekan tabrakan tubuh player vs musuh:
  ```js
  if (entity.isDead && entity.isDead()) return; // Abaikan collision jika musuh mati / sedang dying
  ```
  Ini mencegah player terkena damage ketika menembus sisa-sisa jubah Wraith saat memutar animasi hancurnya.

---

## 7. Enemy Behavior (Bringer of Death)

Musuh memuat individual file frame-by-frame PNG untuk animasi `Idle` (8 frame) dan `Death` (10 frame) secara asinkronus ke cache global untuk menghemat memori.
- **Floating Hover Effect**: Musuh melayang naik-turun menggunakan gelombang sinus procedural:
  ```js
  floatTimer += delta * 3;
  floatOffset = Math.sin(floatTimer) * 0.12;
  mesh.position.y = y + height / 2 + floatOffset;
  ```
- **State ALIVE**: Bergerak ke kiri mengikuti `worldSpeed`, memutar animasi idle 8-frame berulang (looping) pada 10 FPS.
- **State DYING**: Kecepatan laju melambat menjadi 10% dari normal (`worldSpeed * 0.1`). Memutar animasi kematian 10-frame sekali (tidak looping) kemudian menghapus dirinya (`toRemove = true`) untuk dibersihkan dari scene.

---

## 8. Spawn Manager & Difficulty Scaling

`SpawnManager` mengelola pembuatan rintangan dan musuh:
- Spawn diordinasikan di luar layar sebelah kanan (`X = 12.0`).
- **Probabilitas**: `SPAWN_OBSTACLE_CHANCE` (60%) melahirkan obstacle, selebihnya (40%) melahirkan musuh.
- **Obstacle Tipe**: Terbagi rata 50% `LOW` (dilewati dengan lompat) dan 50% `HIGH` (dilewati dengan slide).
- **Interval Spawning**: Ditentukan acak antara `SPAWN_MIN_INTERVAL` dan `SPAWN_MAX_INTERVAL`.
- **Difficulty Scaling**: 
  - Kecepatan dunia (`worldSpeed`) bertambah secara bertahap sebesar `WORLD_SPEED_INCREMENT` (+0.2) setiap 10 detik.
  - Setelah skor pemain melebihi `100`, interval spawn dikalikan sebesar `0.75x` (membuat objek spawn 25% lebih cepat dan rapat).

---

## 9. Performance & Memory Management

- **Texture Cache**: Gambar musuh Bringer of Death dimuat sekali saja ke `enemyTexturesCache` dan dibagikan ke semua instance musuh.
- **Asset Fallback**: Semua entitas visual dirancang untuk melakukan fallback otomatis ke warna solid (misalnya, warna emerald green `#10B981` untuk player, warna merah `#ef4444` untuk musuh) jika asset gambar gagal dimuat, menjaga game agar tidak crash.
- **WebGL Cleanups**: Setiap entitas yang dihapus dari game memanggil fungsi `.destroy()` untuk mendispose geometri (`geometry.dispose()`) dan material (`material.dispose()`) Three.js demi menghindari memory leak.

---

## 10. Config Terpusat — `constants.js`

```js
export const CONFIG = {
  // World Settings
  WORLD_SPEED_BASE: 5,          // kecepatan awal (unit per detik)
  WORLD_SPEED_INCREMENT: 0.2,   // penambahan kecepatan setiap 10 detik
  GRAVITY: -34,                 // gravitasi (disetel untuk lompatan responsif & berat)

  // Player Settings
  PLAYER_SCALE: 1.5,            // faktor skala pembesaran tubuh Loka (1.5x lebih besar)
  JUMP_FORCE: 16,               // kekuatan impuls lompatan
  SLIDE_DURATION: 700,          // durasi meluncur (milidetik)
  ATTACK_HITBOX_WIDTH: 1.5,     // jangkauan serang pedang di depan Loka
  ATTACK_HITBOX_DURATION: 583,  // durasi hitbox serang aktif (selaras dengan 7 frame)
  GROUND_Y: -2.5,               // koordinat Y tanah

  // Spawn Settings
  SPAWN_MIN_INTERVAL: 1500,     // interval spawn minimum (ms)
  SPAWN_MAX_INTERVAL: 3000,     // interval spawn maksimum (ms)
  SPAWN_OBSTACLE_CHANCE: 0.6,   // 60% rintangan, 40% musuh

  // Scoring
  SCORE_PER_SECOND: 1,
  SCORE_PER_KILL: 10,
  SCORE_PER_AVOID: 5,

  // Spritesheet Layouts
  PLAYER_IDLE_COLS: 5,
  PLAYER_IDLE_ROWS: 1,
  PLAYER_RUN_COLS: 6,
  PLAYER_RUN_ROWS: 1,
  PLAYER_SLIDE_COLS: 5,
  PLAYER_SLIDE_ROWS: 1,
  PLAYER_ATTACK_COLS: 7,
  PLAYER_ATTACK_ROWS: 1,
  PLAYER_ANIM_FPS: 14,          // frame-rate animasi Loka

  // Ground and Obstacle Texture Indices
  GROUND_TEXTURE_INDEX: 40,        // texture_16px 40.png (aspal)
  OBSTACLE_LOW_TEXTURE_INDEX: 265,  // texture_16px 265.png (rintangan bawah)
  OBSTACLE_HIGH_TEXTURE_INDEX: 265, // texture_16px 265.png (rintangan atas)

  // Enemy settings
  ENEMY_SCALE: 1.5,             // faktor skala pembesaran Bringer of Death
  ENEMY_ANIM_FPS: 10,           // frame-rate animasi musuh
};
```

---

## 11. Dependencies (`package.json`)

```json
{
  "name": "adventure-of-loka",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.165.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```
