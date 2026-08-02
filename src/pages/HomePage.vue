<script setup>
// biome-ignore lint/correctness/noUnusedImports: Used in Vue template
import HeroVideo from '../components/HeroVideo.vue'
// biome-ignore lint/correctness/noUnusedImports: Used in Vue template
import ProfilDesa from '../components/ProfilDesa.vue'
// biome-ignore lint/correctness/noUnusedImports: Used in Vue template
import VisiMisiSection from '../components/VisiMisiSection.vue'
// biome-ignore lint/correctness/noUnusedImports: Used in Vue template
import PreviewWisata from '../components/PreviewWisata.vue'
// biome-ignore lint/correctness/noUnusedImports: Used in Vue template
import PreviewGaleri from '../components/PreviewGaleri.vue'
import { useSeo } from '../composables/useSeo.js'

// Beranda memakai judul dan deskripsi yang sama dengan bawaan index.html supaya
// tidak terjadi perbedaan antara versi statis (yang dibaca bot pratinjau) dan
// versi hasil render JS.
useSeo({
  title: 'Desa Wisata Budaya Umbul Limus – Pesawaran, Lampung',
  description:
    'Desa Umbul Limus, Kecamatan Marga Punduh, Kabupaten Pesawaran, Lampung. Wisata alam mata air jernih, air terjun, suasana pedesaan asri, dan warisan budaya Lampung Saibatin.',
  path: '/',
})
</script>

<template>
  <HeroVideo />
  <ProfilDesa />
  <VisiMisiSection />
  <PreviewWisata />
  <PreviewGaleri />
</template>
