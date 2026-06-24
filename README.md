# Adventure of Loka 

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Stack](https://img.shields.io/badge/built%20with-Vite-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Renderer](https://img.shields.io/badge/renderer-Three.js-000000.svg?logo=three.js)](https://threejs.org/)

**Adventure of Loka** adalah game web *endless runner* 2D side-scrolling yang dibangun menggunakan **Three.js** dan **Vanilla JavaScript** dengan build tool **Vite**. Pemain mengontrol karakter utama yang berlari melintasi kota berarsitektur ubin pixel-art modern sambil menghindari rintangan udara/tanah dan mengalahkan musuh mengerikan **Bringer of Death**.

---

## 🎮 Gameplay & Fitur Utama

- **Endless Side-Scroller**: Dunia bergerak ke kiri seiring waktu dengan kecepatan yang meningkat secara berkala (difficulty scaling).
- **Mekanik Gerakan Dinamis**:
  - **Lompat (Jump)**: Melompati rintangan tanah.
  - **Sliding (Slide)**: Menunduk dengan kompresi visual mesh 80% dan pengecilan hitbox fisik (45% dari tinggi normal) untuk meluncur di bawah rintangan udara.
  - **Serang (Attack)**: Melancarkan tebasan pedang dengan hitbox serang di depan karakter untuk menghancurkan musuh.
- **12-Layer Parallax Background**: Latar belakang kota megah berlapis-lapis (12 layer) yang bergulir dengan kecepatan progresif bertingkat menciptakan depth visual 2.5D yang mendalam.
- **Sistem Ubin Pixel-Art**: Ground (tilemap) dan rintangan diselimuti dengan pola ubin pixel-art 16px yang rapi menggunakan filter *Nearest-Neighbor*.
- **Musuh Bringer-of-Death**: 
  - Karakter musuh besar dengan animasi terbang (Idle 8 frame) dan hancur lebur (Death 10 frame).
  - Menggunakan static texture caching untuk performa optimal.
  - Hitbox presisi yang dirapatkan (50% lebar, 75% tinggi mesh) guna mencegah tabrakan "ghost pixels".
  - Saat mati, hitbox dinonaktifkan sehingga pemain dapat melintasinya dengan aman.
- **HUD & Sistem Skor**: Pencatatan skor waktu bertahan hidup, bonus membunuh musuh (+10), dan melewati rintangan (+5) dengan highscore yang tersimpan di LocalStorage.

---

## 🕹️ Kontrol Game

| Tombol Keyboard | Aksi | Keterangan |
|-----------------|------|------------|
| `Space` / `↑`   | **Jump** | Melompat 1x di udara, dipengaruhi gravitasi |
| `S` / `↓`       | **Slide** | Meluncur ceper di tanah, hitbox mengecil |
| `Z` / `J`       | **Attack**| Menyerang/menebas musuh di depan |

---

## 🛠️ Instalasi & Cara Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda:

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di sistem Anda.

### Langkah-langkah
1. Clone repositori ini:
   ```bash
   git clone https://github.com/username/adventure-of-loka.git
   cd adventure-of-loka
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal (Vite):
   ```bash
   npm run dev
   ```
4. Buka peramban (browser) dan akses alamat yang tertera di terminal (biasanya `http://localhost:3000/` atau `http://127.0.0.1:3000/`).

Untuk memaketkan game ke versi produksi:
```bash
npm run build
```
Hasil kompilasi akan berada di dalam folder `/dist/`.

---

## 🧱 Arsitektur Kode & File

Proyek ini menggunakan struktur modular ES Modules:
```
/adventure-of-loka/
├── index.html                  # Halaman utama game
├── main.js                     # Bootstrap scene, kamera, renderer Three.js
├── package.json                # Metadata & dependensi proyek
├── /assets/
│   ├── /sprites/               # Animasi spritesheet Player (run, idle, attack, slide)
│   │   └── /enemy/             # Folder frame individual Bringer-of-Death (Idle & Death)
│   ├── /Background layers/     # 12 layer latar belakang parallax kota
│   └── /texture/               # Koleksi ubin pixel-art 16x16px
└── /src/
    ├── /config/
    │   └── constants.js        # Konfigurasi konstanta, kecepatan, dan indeks ubin game
    ├── /core/
    │   ├── Game.js             # State machine game (START, PLAYING, GAMEOVER)
    │   ├── GameLoop.js         # Pengatur requestAnimationFrame & Delta Time
    │   └── InputHandler.js     # Keyboard input listener
    ├── /entities/
    │   ├── Player.js           # Fisika, hitbox, dan state animasi Player
    │   ├── Obstacle.js         # Rintangan tanah (LOW) & udara (HIGH) bertekstur
    │   └── Enemy.js            # Wraith Bringer of Death & animasi Idle/Death
    ├── /systems/
    │   ├── SpriteAnimator.js   # Pengiris grid & penggerak frame spritesheet
    │   ├── SpawnManager.js     # Manajemen kemunculan rintangan & musuh
    │   ├── CollisionSystem.js  # Detektor tabrakan AABB presisi
    │   ├── ScoreSystem.js      # Sistem skor & pencatatan highscore
    │   └── ParallaxBackground.js # Penggulung latar belakang 12-layer & ubin ground
    └── /ui/
        ├── HUD.js              # HUD skor real-time
        ├── StartScreen.js      # Layar mulai game
        └── GameOverScreen.js   # Layar game over & tombol restart
```

---

## 🚀 Teknologi

- **Three.js (r165+)**: Renderer 3D/2D WebGL berkinerja tinggi.
- **Vite**: Bundler frontend super cepat untuk local development dan production build.
- **CSS3 Glassmorphism**: Untuk tampilan UI HUD, Start Screen, dan Game Over Screen yang premium, transparan, dan modern.
- **Outfit (Google Fonts)**: Tipografi premium untuk antarmuka game.
