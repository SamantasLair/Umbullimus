/**
 * @file scripts/prerender.js
 * @author @SamantasLair (https://github.com/SamantasLair)
 * @description Script post-build Prerenderer untuk menghasilkan berkas HTML statis
 * pra-render bagi setiap rute SPA (/bagan, /infografis, /galeri).
 * Menjamin crawler media sosial (WhatsApp, Facebook, Twitter) & Googlebot membaca meta tag persis.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.resolve(__dirname, '../dist')
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html')

const SITE_URL = 'https://umbullimus.my.id'
const DEFAULT_IMAGE = 'https://umbullimus.my.id/AirTerjun.jpg'

const routes = [
  {
    path: '/',
    dir: DIST_DIR,
    title: 'Desa Wisata Budaya Umbul Limus – Pesawaran, Lampung',
    description:
      'Desa Umbul Limus, Kecamatan Marga Punduh, Kabupaten Pesawaran, Lampung. Wisata alam mata air jernih, air terjun, suasana pedesaan asri, dan warisan budaya Lampung.',
    image: DEFAULT_IMAGE,
  },
  {
    path: '/bagan',
    dir: path.join(DIST_DIR, 'bagan'),
    title: 'Struktur Organisasi & Lembaga Desa Umbul Limus',
    description:
      'Situs resmi struktur organisasi Pemerintah Desa Umbul Limus, BPD, perangkat desa, serta lembaga adat Saibatin.',
    image: DEFAULT_IMAGE,
  },
  {
    path: '/infografis',
    dir: path.join(DIST_DIR, 'infografis'),
    title: 'Infografis & Data Desa Umbul Limus',
    description:
      'Data statistik Desa Umbul Limus, Marga Punduh, Pesawaran: jumlah penduduk, luas wilayah, jumlah dusun, RT dan RW, serta profil kependudukan desa.',
    image: DEFAULT_IMAGE,
  },
  {
    path: '/galeri',
    dir: path.join(DIST_DIR, 'galeri'),
    title: 'Galeri Foto Desa Umbul Limus – Pesawaran',
    description:
      'Koleksi foto panorama alam, air terjun, kegiatan warga, dan dokumentasi kebudayaan Desa Umbul Limus, Pesawaran, Lampung.',
    image: DEFAULT_IMAGE,
  },
]

function prerender() {
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error(`[Prerender Error] Berkas ${INDEX_HTML_PATH} tidak ditemukan. Jalankan 'vite build' terlebih dahulu.`)
    process.exit(1)
  }

  const baseHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8')

  console.log('🚀 Memulai Static Prerendering Rute SEO...')

  for (const route of routes) {
    const fullUrl = route.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${route.path}`
    
    let html = baseHtml
      // Replace Title
      .replace(/<title>.*?<\/title>/gi, `<title>${route.title}</title>`)
      // Replace Description
      .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/gi, `<meta name="description" content="${route.description}" />`)
      // Replace Canonical
      .replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/gi, `<link rel="canonical" href="${fullUrl}" />`)
      // Replace Open Graph Tags
      .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${route.title}" />`)
      .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${route.description}" />`)
      .replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/gi, `<meta property="og:url" content="${fullUrl}" />`)
      .replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/gi, `<meta property="og:image" content="${route.image}" />`)
      // Replace Twitter Tags
      .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/gi, `<meta name="twitter:title" content="${route.title}" />`)
      .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/gi, `<meta name="twitter:description" content="${route.description}" />`)
      .replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/gi, `<meta name="twitter:image" content="${route.image}" />`)

    // Pastikan direktori tujuan ada
    if (!fs.existsSync(route.dir)) {
      fs.mkdirSync(route.dir, { recursive: true })
    }

    const targetFilePath = path.join(route.dir, 'index.html')
    fs.writeFileSync(targetFilePath, html, 'utf-8')
    console.log(` ✅ Prerendered: ${route.path} -> ${targetFilePath}`)
  }

  console.log('✨ Static Prerendering SEO Selesai 100%!')
}

prerender()
