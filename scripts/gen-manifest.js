/**
 * gen-manifest.js
 * Auto-generate public/images/galeri/manifest.json dari isi folder.
 *
 * Cara pakai:
 *   node scripts/gen-manifest.js
 *
 * Ekstensi yang di-scan: .jpg, .jpeg, .png, .webp, .avif
 * Output: public/images/galeri/manifest.json
 */
import { readdirSync, writeFileSync, existsSync } from 'fs'
import { extname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

const GALERI_DIR   = join(__dirname, '..', 'public', 'images', 'galeri')
const MANIFEST_OUT = join(GALERI_DIR, 'manifest.json')
const ALLOWED_EXT  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

if (!existsSync(GALERI_DIR)) {
  console.error(`❌ Folder tidak ditemukan: ${GALERI_DIR}`)
  process.exit(1)
}

const files = readdirSync(GALERI_DIR).filter(f => {
  const ext = extname(f).toLowerCase()
  return ALLOWED_EXT.has(ext) && f !== 'manifest.json'
})

if (files.length === 0) {
  console.warn('⚠️  Tidak ada gambar ditemukan di folder galeri.')
}

const images = files.map(f => ({
  src: `/images/galeri/${f}`,
  alt: basename(f, extname(f)).replace(/[-_]/g, ' '),
  kategori: 'umum'
}))

const manifest = { images }
writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2), 'utf-8')
console.log(`✅ Manifest dibuat: ${images.length} gambar → ${MANIFEST_OUT}`)
