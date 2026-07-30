# 🌴 Web Profil Desa & Bagan Struktur Interaktif

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4fc08d?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Author](https://img.shields.io/badge/Developer-%40SamantasLair-d4a853?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SamantasLair)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Aplikasi Web Profil Desa dan Bagan Struktur Organisasi Interaktif berbasis Vue 3 & Vite dengan konsep estetika **Batik Rimba** (*Terracotta, Sage Green, Krem Gading*).

> 👨‍💻 **Dikembangkan oleh:** [@SamantasLair](https://github.com/SamantasLair)

---

## 🎯 Tujuan Pembuatan Web

1. **Digitalisasi Informasi Desa**: Menyediakan pusat informasi publik desa yang cepat, modern, dan mudah diakses oleh warga maupun wisatawan melalui perangkat seluler dan desktop.
2. **Transparansi Pemerintahan Desa**: Menampilkan Struktur Organisasi Aparat Desa, BPD, hingga Tingkat RT secara jelas, interaktif, dan dapat diunduh dalam bentuk berkas resolusi tinggi.
3. **Publikasi Ekowisata & Potensi Desa**: Mengenalkan keindahan ekowisata (seperti Air Terjun & Danau), infografis demografi penduduk, serta pelestarian struktur adat budaya **Lampung Saibatin**.
4. **Platform Mudah Dikelola (Zero-Code Maintenance)**: Memungkinkan pengelola desa memperbarui seluruh data (pejabat, statistik, berita, galeri) hanya dengan mengedit berkas JSON tanpa perlu keahlian koding.

---

## ⭐ Kelebihan & Keunggulan Utama

- 🎨 **Desain Estetika Batik Rimba**: Visual premium berstandar tinggi menggunakan palet warna Nusantara (*Batik Rimba*) dengan mikro-animasi halus (*Anime.js*) yang tidak monoton.
- 📊 **Bagan Struktur Organisasi Interaktif**:
  - Penghitungan geometri sumbu SVG dinamis secara otomatis (*zero line overlap*).
  - **Engine Ekspor PNG Canvas Murni**: Fitur unduh bagan ke gambar PNG resolusi tinggi (Opsi Latar Solid & Latar Transparan) berbasis Canvas 2D tanpa latensi atau dependensi eksternal.
- 👑 **Modul Kebudayaan Tokoh Adat Saibatin**: Visualisasi hierarki 8 jenjang gelar adat Lampung Saibatin (*Khaghya, Khaja, Minak, Khadin*).
- ⚙️ **Arsitektur Data Terpisah (Zero-Code Editability)**: Seluruh data desa dipisah di folder `public/data/` (JSON), mempermudah replikasi proyek untuk desa lain dalam hitungan menit.
- 📱 **Responsif & Ringan**: Skema CSS Variables modern, *Zero Layout Shift*, serta optimasi performa tinggi untuk jaringan lambat.

---

## 🚀 Rencana & Kebutuhan Pengembangan Ke Depannya (Roadmap)

Untuk pengembangan tahap berikutnya, fitur-fitur berikut sangat direkomendasikan untuk ditingkatkan:

- [ ] **1. Implementation Static Site Generation (SSG / Prerender)**:
  - *Tujuan*: Agar Meta Tag SEO, Open Graph (WhatsApp / Facebook Link Preview), dan Twitter Card dapat terbaca penuh secara langsung oleh bot media sosial tanpa memerlukan eksekusi JavaScript.
- [ ] **2. Modul Berita & Pengumuman Desa (CMS Integration)**:
  - *Tujuan*: Integrasi sistem artikel berita, agenda kegiatan desa, dan pengumuman resmi desa berbasis Decap CMS / Markdown.
- [ ] **3. Peta Digital Interaktif GIS (Geographic Information System)**:
  - *Tujuan*: Peta lokasi wisata, batas wilayah dusun, dan fasilitas umum menggunakan *Leaflet.js* atau *Mapbox*.
- [ ] **4. Layanan Pengaduan & Surat Online Warga**:
  - *Tujuan*: Formulir pengajuan surat keterangan online (SKU, SKTM, dll.) serta saluran aspirasi warga berbasis API.

---

## 💻 Panduan Singkat Development

```bash
# Install dependensi
npm install

# Jalankan server lokal
npm run dev

# Build produksi
npm run build
```

---

## 📄 Lisensi & Atribusi

Dikembangkan oleh **[@SamantasLair](https://github.com/SamantasLair)** di bawah lisensi [MIT](LICENSE). Bebas digunakan, dipelajari, dan dikembangkan kembali untuk kegiatan pengabdian masyarakat & KKN.
