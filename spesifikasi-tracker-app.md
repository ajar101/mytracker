# Spesifikasi Aplikasi: Personal Tracker (Ibadah, Gym, Custom)

## 1\. Ringkasan

Aplikasi web personal untuk tracking ibadah, gym, dan kebiasaan custom lainnya. Dibangun sebagai **PWA (Progressive Web App)**, di-deploy ke **Vercel**, bisa di-install di iPhone (dan Android) layaknya aplikasi native, mendukung penggunaan **offline**, dan didesain **mobile-first** khusus untuk layar iPhone 15 Pro (dan responsive ke ukuran layar lain).

Bukan menggunakan Google Sheets, Notion, atau aplikasi dari App Store — sepenuhnya custom web app milik sendiri.

\---

## 2\. Tech Stack

|Layer|Pilihan|Alasan|
|-|-|-|
|Framework|Next.js (React)|Support PWA, mudah deploy ke Vercel, App Router modern|
|Styling|Tailwind CSS|Cepat untuk desain mobile-first \& responsive|
|Storage data|localStorage (default) → opsional upgrade ke Supabase|Lihat bagian 6|
|PWA|next-pwa / manifest.json + service worker manual|Agar bisa di-install \& jalan offline|
|Hosting|Vercel (free tier)|Deploy otomatis dari GitHub, gratis, cepat|
|Charts (statistik)|Recharts atau Chart.js|Grafik mingguan/bulanan per kategori|

\---

## 3\. Struktur Data (Data Model)

### 3.1 Ibadah

**Shalat Wajib** (5 item default, tidak bisa dihapus, tapi bisa disembunyikan/nonaktifkan):

* Subuh, Dzuhur, Ashar, Maghrib, Isya

Setiap shalat wajib punya **status pilihan** (radio button), bukan sekadar checklist:

* `Tidak` — belum/tidak shalat
* `Di rumah` — shalat sendiri di rumah
* `Berjamaah` — shalat berjamaah (di rumah/kelompok)
* `Masjid` — shalat di masjid

Next Step ada pilihan berupa : 'Awal Waktu' dan 'Tidak Awal Waktu'

**Shalat Sunnah** (default, opsional dicentang selesai/tidak):

* Tahajud
* Dhuha

**Custom Ibadah** (bebas ditambah/edit/hapus oleh user):

* Contoh: Tilawah Qur'an, Dzikir Pagi/Petang, Sedekah, Puasa Sunnah, dll
* Tipe input fleksibel: checklist selesai/tidak, atau dengan catatan angka (misal Tilawah: berapa halaman)

### 3.2 Gym / Workout

**Steps** (default, dengan target vs realisasi):

* Target harian (misal 10.000 langkah) — bisa diatur di setting
* Realisasi diisi manual setiap hari
* Otomatis dihitung persentase capaian (realisasi/target)

**Custom Workout** (bebas ditambah/edit/hapus oleh user):

* Contoh: Push-Up 100x, Pull-Up 100x, Bench Press, Lari 5km, dll
* Setiap item punya: nama, target (angka + satuan bebas seperti "x", "kg", "menit", "km"), realisasi harian
* Catatan bebas (opsional) — misal "Push day", "terasa berat hari ini"

### 3.3 Custom (kategori umum, di luar ibadah \& gym)

* Item benar-benar bebas: nama item, tipe (checklist / angka dengan target)
* Bisa tambah/edit/hapus kapan saja
* Contoh: Baca buku, Minum air 2L, Tidur sebelum jam 10

### 3.4 Struktur penyimpanan per hari (contoh JSON)

```json
{
  "date": "2026-08-10",
  "ibadah": {
    "wajib": {
      "subuh": "berjamaah",
      "dzuhur": "di\_rumah",
      "ashar": "tidak",
      "maghrib": "masjid",
      "isya": "di\_rumah"
    },
    "sunnah": {
      "tahajud": true,
      "dhuha": false
    },
    "custom": \[
      { "id": "tilawah", "name": "Tilawah Qur'an", "done": true, "value": 5, "unit": "halaman" }
    ]
  },
  "gym": {
    "steps": { "target": 10000, "actual": 7500 },
    "custom": \[
      { "id": "pushup", "name": "Push-Up", "target": 100, "actual": 100, "unit": "x", "note": "Push day" }
    ]
  },
  "custom\_general": \[
    { "id": "baca\_buku", "name": "Baca Buku", "done": true }
  ]
}
```

\---

## 4\. Fitur

### 4.1 Tab "Today"

* Menampilkan checklist hari ini, dikelompokkan per kategori: Ibadah, Gym, Custom
* Shalat wajib: 5 tombol radio (Tidak / Di rumah / Berjamaah / Masjid)
* Shalat sunnah \& custom ibadah: toggle/checklist, sebagian bisa isi angka
* Gym: Steps (input angka realisasi vs target ditampilkan sebagai progress bar), custom workout dengan target vs realisasi
* Tombol "+" di tiap section untuk tambah item custom baru (nama, tipe, target, satuan)
* Setiap item custom bisa di-edit/hapus lewat long-press atau tombol edit
* Skor harian ditampilkan **terpisah per kategori** (tidak digabung jadi satu angka)

### 4.2 Tab "History"

* Kalender bulanan, setiap tanggal punya indikator visual (misal 3 dot/bar kecil warna berbeda: ibadah, gym, custom)
* Klik tanggal → detail lengkap checklist hari itu (termasuk status shalat, angka steps, catatan workout, dll)
* Bisa scroll ke bulan sebelumnya untuk lihat histori lama

### 4.3 Tab "Statistik"

* Grafik mingguan \& bulanan, dipisah per kategori (3 grafik/garis berbeda)
* Untuk ibadah: breakdown status shalat (berapa % berjamaah/masjid vs di rumah vs tidak) per minggu
* Untuk gym: rata-rata steps vs target, progress custom workout dari waktu ke waktu
* Streak per kategori (misal: "Shalat berjamaah: 5 hari beruntun", "Steps tercapai: 3 hari beruntun")
* Ringkasan bulanan: total capaian, hari terbaik, hari yang perlu diperbaiki

### 4.4 Dashboard (halaman utama/ringkasan)

* Landing page saat buka app, sebelum masuk ke tab spesifik
* Ringkasan cepat hari ini: progress ring per kategori (Ibadah/Gym/Custom)
* Highlight streak aktif saat ini
* Quick stats minggu ini (misal: "Shalat berjamaah 12/20", "Steps tercapai 4/7 hari")
* Shortcut cepat ke item yang belum diisi hari ini

### 4.5 Setting / Kelola Item

* Halaman untuk mengatur target default (steps, dll)
* Tambah/edit/hapus custom item untuk ibadah, gym, dan kategori custom umum
* Aktif/nonaktifkan item default jika tidak dipakai

\---

## 5\. Struktur Navigasi

```
Bottom Navigation (4 tab):
├── Dashboard   (ringkasan/home)
├── Today       (input harian)
├── History     (kalender \& histori)
└── Statistik   (grafik \& analisis)

Settings diakses lewat ikon di pojok atas (bukan bottom nav)
```

\---

## 6\. Strategi Penyimpanan Data

|Opsi|Kelebihan|Kekurangan|
|-|-|-|
|**localStorage**|Simpel, tanpa setup akun tambahan, langsung jalan|Data hanya tersimpan di 1 device/browser, hilang jika clear data, tidak bisa sync antar HP/laptop|
|**Supabase** (opsional upgrade)|Data tersimpan di cloud, bisa sync multi-device, lebih aman dari kehilangan data|Perlu setup akun Supabase, sedikit konfigurasi tambahan (masih gratis untuk skala personal)|

**Rekomendasi:** mulai dengan **localStorage** dulu untuk versi pertama (paling cepat jalan), dengan struktur kode yang sudah dipisah rapi (data layer terpisah dari UI) — supaya nanti gampang upgrade ke Supabase tanpa bongkar total aplikasinya.

\---

## 7\. PWA Requirements

Agar bisa di-install di iPhone 15 Pro dan terasa seperti app native:

* `manifest.json` — nama app, icon (berbagai ukuran: 192x192, 512x512), warna tema, mode `standalone`
* Service worker — untuk caching asset \& mendukung akses offline
* Meta tag khusus iOS Safari (`apple-touch-icon`, `apple-mobile-web-app-capable`) agar tampil rapi saat di-"Add to Home Screen"
* Desain responsive dengan breakpoint utama di lebar layar iPhone (\~390-430px), safe-area padding untuk notch/dynamic island

\---

## 8\. Rencana Deploy ke Vercel

1. Push project ke repository GitHub (private/public sesuai preferensi)
2. Buat akun Vercel (gratis, bisa login pakai GitHub)
3. Import repository ke Vercel → otomatis terdeteksi sebagai project Next.js
4. Deploy otomatis, dapat URL (misal `tracker-kamu.vercel.app`)
5. Buka URL tsb di Safari iPhone → tap Share → "Add to Home Screen"
6. Setiap update kode di GitHub akan otomatis re-deploy ke Vercel

\---

## 9\. Struktur Folder Project (rencana)

```
tracker-app/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── today/page.tsx
│   ├── history/page.tsx
│   ├── stats/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── ibadah/
│   ├── gym/
│   ├── custom/
│   └── shared/
├── lib/
│   ├── storage.ts            # abstraksi localStorage (mudah diganti Supabase nanti)
│   └── scoring.ts            # logika perhitungan skor per kategori
├── public/
│   ├── manifest.json
│   └── icons/
└── styles/
```

\---

## 10\. Langkah Selanjutnya

1. Review \& sesuaikan spesifikasi ini jika ada yang mau diubah
2. Setelah disetujui → mulai pembuatan source code sesuai struktur di atas
3. Setup repo GitHub + akun Vercel
4. Deploy versi pertama (localStorage), test di iPhone
5. (Opsional, tahap lanjut) Upgrade storage ke Supabase jika butuh sync multi-device

