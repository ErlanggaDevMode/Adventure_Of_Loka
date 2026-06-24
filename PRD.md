# PRD — Adventure Of Loka (Web)
**Version:** 1.0 — MVP Sprint Completed  
**Stack:** Three.js · Vanilla JS · HTML5 Canvas/WebGL  
**Target Platform:** Web Browser (Desktop & Mobile)  
**IDE:** Antigravity IDE

---

## 1. Overview

Adventure Of Loka adalah game web berbasis Three.js di mana pemain mengontrol Loka, seorang petarung tangguh yang berlari tanpa henti melewati jalanan kota modern bertekstur pixel-art. Tantangan datang dari rintangan (obstacle) dan musuh melayang misterius Bringer of Death yang harus dihindari atau dikalahkan dengan tebasan pedang. Skor terus bertambah selama Loka masih hidup.

### Tagline
> *"Lari, serang, bertahan — petualangan Loka di kota abadi."*

---

## 2. Goals (MVP)

| # | Goal | Metrik Sukses | Status |
|---|------|---------------|--------|
| 1 | Karakter bisa lari secara looping | Animasi idle, run, slide, & attack dari spritesheet berjalan smooth | ✅ |
| 2 | Input kontrol responsif | Jump, slide, attack terdaftar dalam <100ms | ✅ |
| 3 | Obstacle & musuh muncul | Spawn dari kanan, bergerak ke kiri, collision terjadi | ✅ |
| 4 | Sistem skor berjalan | Score naik per detik + bonus kill musuh | ✅ |
| 5 | Game Over + Restart | Layar game over muncul, pemain bisa main ulang | ✅ |

---

## 3. Out of Scope (MVP)

- Power-up & item
- Audio / SFX
- Leaderboard online
- Level progression / stage
- Animasi death karakter utama (Loka langsung freeze, tapi musuh memiliki animasi death)
- Double jump
- Mobile touch controls (bisa ditambah pasca-MVP)

---

## 4. Personas

**Target User:** Pemain casual berusia 16–30 tahun, familiar dengan browser game, main di sela-sela waktu luang. Tidak butuh tutorial panjang — langsung main.

---

## 5. Core Gameplay Loop

```
[START]
    ↓
Karakter berlari otomatis →→→
    ↓
Obstacle / Musuh muncul dari kanan
    ↓
Player input: JUMP | SLIDE | ATTACK
    ↓                     ↓
Berhasil avoid/kill    Kena hit
    ↓                     ↓
Score +                GAME OVER screen
    ↓                     ↓
Loop lanjut          Restart / Main lagi
```

---

## 6. Mechanics Detail

### 6.1 Karakter
- Berlari otomatis ke kanan (world yang bergerak ke kiri)
- Posisi X karakter tetap di ~20% lebar layar
- Nama karakter: **Loka** (Tinggi: 2.4 unit, Lebar: 1.2 unit)
- Spritesheet format: **Grid 2D (1 baris × kolom, frame 128x80px)**
  - `idle.png` — 5 frame animasi diam
  - `run.png` — 6 frame animasi berlari
  - `slide.png` — 5 frame animasi meluncur (hitbox mengecil 45% tinggi normal, visual terkompresi 80%)
  - `attack.png` — 7 frame tebasan pedang (durasi hitbox 583ms)

### 6.2 Kontrol

| Aksi | Keyboard | Keterangan |
|------|----------|------------|
| Jump | `Space` / `ArrowUp` | Lompat 1x, ada gravitasi |
| Slide | `ArrowDown` / `S` | Menunduk sementara, hitbox mengecil |
| Attack | `Z` / `J` / `Click` | Animasi serangan, destroy musuh di depan |

### 6.3 Obstacle & Musuh

| Tipe | Contoh | Cara Hadapi |
|------|--------|-------------|
| **Obstacle LOW (Ubin 265)** | Rintangan tanah berukuran 1.5x1.5 | Lompat (Jump) |
| **Obstacle HIGH (Ubin 265)** | Rintangan gantung berukuran 1.5x1.8 | Meluncur (Slide) |
| **Musuh (Bringer-of-Death)** | Wraith bersabit melayang naik-turun | Serang (Attack) |

- Spawn dari sisi kanan layar
- Bergerak ke kiri dengan kecepatan meningkat seiring waktu
- Hitbox musuh dirapatkan (50% lebar, 75% tinggi visual) agar presisi
- Musuh yang mati memutar 10-frame animasi hancur (Death) dan tidak melukai player

### 6.4 Scoring
- **+1 poin/detik** selama hidup
- **+10 poin** per musuh yang dikalahkan
- **+5 poin** per obstacle yang dilewati dengan sukses (timing window)
- Skor ditampilkan di HUD pojok kanan atas

---

## 7. Screens

### Screen 1 — Start Screen
- Judul game `Adventure of Loka` + instruksi kontrol singkat
- Tombol "Mulai Bermain" untuk mulai

### Screen 2 — Gameplay
- Background: 12-layer progressive parallax cityscape
- Karakter Loka & musuh di foreground
- HUD: Score (kanan atas), tombol kontrol reminder (kiri bawah)

### Screen 3 — Game Over
- Tampilkan skor terakhir dan skor tertinggi
- Tombol "Main Lagi"

---

## 8. Tech Architecture

Lihat [`TECH_SPEC.md`](./TECH_SPEC.md) untuk detail lengkap.

---

## 9. Assets yang Digunakan

| File | Tipe | Keterangan |
|------|------|------------|
| `idle.png` | Spritesheet | 5 frame animasi idle Loka |
| `run.png` | Spritesheet | 6 frame animasi lari Loka |
| `slide.png` | Spritesheet | 5 frame animasi meluncur Loka |
| `attack.png` | Spritesheet | 7 frame tebasan pedang Loka |
| `Layer_0000_9.png` s.d `Layer_0011_0.png` | Parallax | 12 layer latar kota |
| `texture_16px 40.png` | Ubin | Tekstur pixel-art aspal/ground |
| `texture_16px 265.png` | Ubin | Tekstur pixel-art obstacle |
| `Bringer-of-Death_Idle_X.png` | Frame | 8 frame individual animasi melayang musuh |
| `Bringer-of-Death_Death_X.png` | Frame | 10 frame individual animasi mati musuh |

---

## 10. Milestones (MVP Sprint)

| Fase | Task | Status |
|------|------|--------|
| **M1** | Setup Three.js scene, kamera ortografis, ground | [x] |
| **M2** | Load spritesheet karakter, animasi idle + run | [x] |
| **M3** | World scrolling (parallax background) | [x] |
| **M4** | Input handler: jump, slide, attack | [x] |
| **M5** | Obstacle spawner + collision detection | [x] |
| **M6** | Enemy spawner + combat system | [x] |
| **M7** | Scoring system + HUD | [x] |
| **M8** | Game Over screen + restart flow | [x] |
| **M9** | Polish + playtest | [x] |

---

## 11. Open Questions (All Resolved)

- **Nama karakter**: Loka.
- **Jumlah frame per animasi**: Idle (5), Run (6), Slide (5), Attack (7).
- **Ukuran satu frame**: 128x80px.
- **Animasi serangan & meluncur**: Diambil dari file terpisah `attack.png` dan `slide.png`.
