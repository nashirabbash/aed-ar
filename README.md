# AR AED & RJP Simulator

Aplikasi **WebXR Augmented Reality** untuk simulasi penggunaan **AED** (Automated External Defibrillator) dan proses **RJP/CPR** (Resusitasi Jantung Paru). Dibangun dengan React + Three.js dan dirancang untuk berjalan di headset **Meta Quest** melalui browser (WebXR).

Pengguna dapat masuk ke mode AR, menempatkan pad AED pada pasien simulasi (phantom), dan mengikuti panduan suara AED langkah demi langkah — meniru alur penanganan henti jantung di dunia nyata.

---

## Fitur

- **Sesi WebXR AR** dengan passthrough dan DOM overlay untuk Meta Quest.
- **Image tracking** berbasis marker untuk menambatkan scene ke dunia nyata.
- **Grab interaktif** pad AED memakai hand tracking / controller (dengan dukungan mouse di desktop untuk pengembangan).
- **Panduan suara AED** lengkap: analisis ritme, perintah shock, instruksi CPR — diputar berurutan dengan jeda sesuai prosedur.
- **Layar AED dinamis** yang dirender sebagai texture pada model 3D.
- Beberapa **mode simulasi & uji** terpisah (AED, RJP, pad test, button test, marker test).

---

## Teknologi

| Kategori | Stack |
|----------|-------|
| Framework | React 18 + TypeScript |
| 3D / WebXR | Three.js, @react-three/fiber, @react-three/drei, @react-three/xr |
| Build tool | Vite 5 |
| HTTPS lokal | vite-plugin-mkcert (wajib untuk WebXR) |
| Package manager | **Bun** |

---

## Prasyarat

- [Bun](https://bun.sh) terpasang.
- Browser dengan dukungan **WebXR** (Meta Quest Browser, atau Chrome desktop + emulator WebXR untuk pengembangan).
- Untuk uji di Quest: headset dan komputer dev berada di **jaringan yang sama**.

---

## Memulai

```bash
# 1. Install dependency
bun install

# 2. Jalankan dev server (HTTPS via mkcert)
bun run dev
```

Dev server berjalan melalui HTTPS — wajib agar WebXR aktif. Buka URL yang ditampilkan Vite di browser.

### Menjalankan di Meta Quest

1. Pastikan Quest dan komputer dev terhubung ke jaringan yang sama.
2. Vite mengekspos URL jaringan (mis. `https://192.168.x.x:5173`). Buka URL itu di Quest Browser.
3. Terima sertifikat self-signed (mkcert) bila diminta.
4. Tekan tombol **Enter AR**, lalu arahkan ke marker untuk memulai simulasi.

---

## Script

| Perintah | Fungsi |
|----------|--------|
| `bun run dev` | Jalankan dev server HTTPS |
| `bun run build` | Type-check (`tsc`) + build produksi (`vite build`) |
| `bun run preview` | Preview hasil build |
| `bun run doctor` | Jalankan react-doctor (lint/diagnostik) |

---

## Struktur Proyek

```
xr/
├── asset/                  # Model 3D (.glb), marker, dan voice prompt AED (.wav/.m4a)
│   └── voice/wav/          # Aset suara panduan AED
├── src/
│   ├── App.tsx             # Root: state mode, XR store, entry AR
│   ├── main.tsx            # Bootstrap React
│   ├── xr/                 # Infrastruktur XR
│   │   ├── XRScene.tsx     # Komposisi scene
│   │   ├── ImageTracker.tsx# Image tracking berbasis marker
│   │   └── KeyboardMovement.tsx # Navigasi desktop saat dev
│   ├── components/         # Komponen simulasi (satu folder per fitur)
│   │   ├── PadTest/         # Penempatan pad + alur suara AED (lihat CLAUDE.md di folder)
│   │   ├── AEDModel/, PadModel/, PhantomModel/ # Wrapper model GLB
│   │   ├── AEDTest/, AEDButtonTest/, MarkerTest/ # Mode uji
│   │   └── CLAUDE.md       # Konvensi struktur komponen
│   ├── lib/log.ts          # Helper logging
│   └── types/              # Deklarasi tipe WebXR
└── index.html
```

Setiap komponen mengikuti pola: `index.tsx` (UI utama), `helper.ts` (logika pendukung), `type.ts` (tipe & props). Lihat `src/components/CLAUDE.md`.

---

## Alur Simulasi AED (mode PadTest)

1. **Power ON** → layar AED menyala + panduan suara mulai (Stay calm → Remove clothing → Apply pads).
2. **Tempatkan pad** → grab pad dan lepas di atas dada phantom; gravity mendaratkannya di permukaan.
3. **Tekan tombol Bolt** (pad sudah di phantom) → urutan suara AED penuh dimulai (analisis ritme, shock advised, CPR).
4. **Tekan Bolt lagi / Power OFF** → urutan dihentikan.

Detail teknis ada di [`src/components/PadTest/CLAUDE.md`](src/components/PadTest/CLAUDE.md).

---

## Catatan Pengembangan

- **HTTPS wajib**: WebXR hanya aktif di secure context. `vite-plugin-mkcert` menyediakannya secara otomatis.
- **Grab di XR vs desktop**: di XR pakai `e.point` dari pointer event (controller berada di origin saat hand tracking); di desktop pakai proyeksi raycaster pada grab plane.
- Mode uji terpisah (`marker-test`, `aed-button-test`, dll.) untuk mengisolasi tiap subsistem saat debugging.
