// Manajemen meta tag per rute tanpa dependensi eksternal (@unhead/vue dsb).
//
// Situs ini SPA yang dirender di browser, jadi keempat rute mewarisi satu
// <title> dan <meta description> yang sama dari index.html. Google membaca itu
// sebagai halaman near-duplicate dan hanya mengindeks salah satunya dengan baik.
// Composable ini menimpa meta tersebut saat rute aktif, termasuk canonical,
// Open Graph (penting untuk pratinjau tautan di WhatsApp), dan JSON-LD.
//
// Catatan: karena belum ada prerender, meta ini baru terbaca setelah JS jalan.
// Googlebot menjalankan JS jadi tetap terbaca; crawler yang tidak (mis. bot
// pratinjau WhatsApp) hanya melihat nilai bawaan statis di index.html.

import { watchEffect } from 'vue'

export const SITE_URL = 'https://umbullimus.my.id'
export const SITE_NAME = 'Desa Wisata Umbul Limus'
const DEFAULT_IMAGE = '/AirTerjun.jpg'

const absolute = (path) =>
  !path ? SITE_URL : path.startsWith('http') ? path : SITE_URL + path

const upsert = (selector, build, attrs) => {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = build()
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
}

const metaName = (name, content) => {
  if (!content) return
  upsert(`meta[name="${name}"]`, () => document.createElement('meta'), { name, content })
}

const metaProp = (property, content) => {
  if (!content) return
  upsert(
    `meta[property="${property}"]`,
    () => document.createElement('meta'),
    { property, content },
  )
}

const linkRel = (rel, href) => {
  upsert(`link[rel="${rel}"]`, () => document.createElement('link'), { rel, href })
}

// JSON-LD khusus rute memakai satu penanda tetap supaya selalu tergantikan
// saat pindah halaman — tidak menumpuk dan tidak perlu dibersihkan manual.
const routeJsonLd = (data) => {
  const found = document.head.querySelector('script[data-seo="route"]')
  if (!data) {
    found?.remove()
    return
  }
  const el = found || document.createElement('script')
  if (!found) {
    el.type = 'application/ld+json'
    el.dataset.seo = 'route'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * @param {object|Function} source  Objek meta, atau getter kalau nilainya
 *   bergantung pada data yang dimuat async (getter otomatis dijalankan ulang).
 *   Bentuk: { title, description, path, image, type, jsonLd }
 *   `title` dipakai apa adanya — sengaja tidak menempelkan nama situs otomatis
 *   supaya tidak melewati ~60 karakter yang ditampilkan Google.
 */
export function useSeo(source) {
  watchEffect(() => {
    const m = typeof source === 'function' ? source() : source
    if (!m?.title) return

    const url = absolute(m.path || '/')
    const img = absolute(m.image || DEFAULT_IMAGE)

    document.title = m.title
    metaName('description', m.description)
    linkRel('canonical', url)

    metaProp('og:site_name', SITE_NAME)
    metaProp('og:locale', 'id_ID')
    metaProp('og:type', m.type || 'website')
    metaProp('og:title', m.title)
    metaProp('og:description', m.description)
    metaProp('og:url', url)
    metaProp('og:image', img)

    metaName('twitter:card', 'summary_large_image')
    metaName('twitter:title', m.title)
    metaName('twitter:description', m.description)
    metaName('twitter:image', img)

    routeJsonLd(m.jsonLd)
  })
}

/** Breadcrumb JSON-LD: membantu Google menampilkan jalur navigasi di hasil cari. */
export function breadcrumb(items) {
  const list = Array.isArray(items) ? items : []
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absolute(it.path),
    })),
  }
}
