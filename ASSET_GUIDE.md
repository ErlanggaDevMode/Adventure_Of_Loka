# ASSET_GUIDE.md — Panduan Asset & Konfigurasi Adventure Of Loka

Dokumen ini menyediakan panduan konfigurasi untuk aset visual (spritesheet karakter, animasi musuh, latar belakang paralaks, dan tekstur) yang saat ini digunakan di game **Adventure Of Loka**.

---

## 1. Spritesheet Karakter (Loka)

Semua spritesheet karakter berada di bawah `/assets/sprites/`. Format layout spritesheet diatur di `/src/config/constants.js` sebagai berikut:

| Animasi | File | Grid (Kolom × Baris) | Dimensi Total | Dimensi per Frame | Konstanta Konfigurasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Idle** | `idle.png` | 5 × 1 | 640 × 80 px | 128 × 80 px | `PLAYER_IDLE_COLS: 5`, `PLAYER_IDLE_ROWS: 1` |
| **Run** | `run.png` | 6 × 1 | 768 × 80 px | 128 × 80 px | `PLAYER_RUN_COLS: 6`, `PLAYER_RUN_ROWS: 1` |
| **Slide** | `slide.png` | 5 × 1 | 640 × 80 px | 128 × 80 px | `PLAYER_SLIDE_COLS: 5`, `PLAYER_SLIDE_ROWS: 1` |
| **Attack** | `attack.png` | 7 × 1 | 896 × 80 px | 128 × 80 px | `PLAYER_ATTACK_COLS: 7`, `PLAYER_ATTACK_ROWS: 1` |

* **Animasi FPS**: Kecepatan animasi Loka dikonfigurasi melalui `PLAYER_ANIM_FPS: 14`.

---

## 2. Aset Musuh (Bringer of Death)

Animasi musuh Bringer of Death tidak menggunakan format spritesheet grid tunggal, melainkan deretan frame gambar individual PNG yang dimuat secara dinamis dari folder:

* **Idle**: `/assets/sprites/enemy/Idle/Bringer-of-Death_Idle_1.png` s.d. `_8.png` (8 frame looping)
* **Death**: `/assets/sprites/enemy/Death/Bringer-of-Death_Death_1.png` s.d. `_10.png` (10 frame dijalankan sekali saat kalah)

* **Animasi FPS**: Kecepatan animasi musuh diatur pada `ENEMY_ANIM_FPS: 10`.
* **Skala Ukuran**: Musuh diperbesar secara dinamis melalui `ENEMY_SCALE: 1.5` di berkas konstanta.

---

## 3. Background Layers (Paralaks Kota)

Paralaks latar belakang menggunakan **12 layer kota progresif** yang tersimpan di `/assets/Background layers/`:
* `Layer_0011_0.png` (Langit / Paling Belakang, Z = 0.0)
* ... s.d. ...
* `Layer_0000_9.png` (Kota Depan / Paling Dekat, Z = 1.1)

---

## 4. Tekstur Ubin (Tiles & Ground)

Tekstur aspal jalan dan rintangan dimuat dari folder `/assets/texture/` berdasarkan nomor indeksnya:
* **Ground**: `texture_16px 40.png` (Konfigurasi: `GROUND_TEXTURE_INDEX: 40`)
* **Obstacle LOW**: `texture_16px 265.png` (Konfigurasi: `OBSTACLE_LOW_TEXTURE_INDEX: 265`)
* **Obstacle HIGH**: `texture_16px 265.png` (Konfigurasi: `OBSTACLE_HIGH_TEXTURE_INDEX: 265`)

### Folder Sampah
Aset-aset ubin tekstur lain yang tidak digunakan di dalam game (sebanyak 607 file) dipisahkan ke dalam folder `/assets/sampah/` untuk menjaga kerapian direktori pengembangan.

---

## 5. Troubleshooting Animasi & Aset

### Karakter tampak gepeng / pecah:
* Pastikan dimensi frame individu tetap `128x80 px`. Jika mengubah asset spritesheet, pastikan Anda juga memperbarui nilai kolom dan barisnya di `/src/config/constants.js`.

### Musuh tidak muncul (NaN radius error):
* Periksa apakah `ENEMY_SCALE` di `/src/config/constants.js` telah terdefinisi (default: `1.5`). Kehilangan parameter skala ini akan menyebabkan perhitungan geometri bernilai `NaN`.
