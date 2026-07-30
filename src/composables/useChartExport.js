/**
 * @file useChartExport.js
 * @author @SamantasLair (https://github.com/SamantasLair)
 * @description Composable ekspor bagan struktur organisasi ke format PNG resolusi tinggi berbasis Canvas 2D murni.
 * Fitur: Menggambar Ulang Geometri & Style DOM, Opsi Transparan & Latar Solid, Support Line-Dash (BPD).
 */

// Ekspor bagan struktur ke PNG tanpa dependensi eksternal (html2canvas dsb).
//
// Pendekatan: baca ulang geometri + computed style dari DOM yang SUDAH dirender,
// lalu gambar ulang ke <canvas>. Konsekuensinya hasil ekspor otomatis mengikuti
// tema warna yang sedang aktif (lihat override --c-* di BaganPage.vue) tanpa
// perlu menduplikasi satu pun nilai warna di file ini.

const PAD = 40
const HEADER_H = 115

const isTransparent = (c) =>
  !c || c === 'transparent' || /^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(c)

const directText = (el) => {
  let s = ''
  for (const n of el.childNodes) if (n.nodeType === Node.TEXT_NODE) s += n.nodeValue
  return s.replace(/\s+/g, ' ').trim()
}

const px = (v) => Number.parseFloat(v) || 0

// border-radius bisa "50%" (foto bulat) atau "10px" (kartu)
const radiusOf = (cs, w, h) => {
  const raw = cs.borderTopLeftRadius || '0'
  if (raw.includes('%')) return (px(raw) / 100) * Math.min(w, h)
  return px(raw)
}

// Ambil kotak setiap BARIS teks persis seperti hasil layout browser.
//
// Penting: baris TIDAK boleh dihitung ulang dengan ctx.measureText. Metrik font
// canvas sedikit berbeda dari metrik layout, sehingga teks panjang (mis. nama
// jabatan) bisa terpecah jadi lebih banyak baris daripada yang tampil, lalu
// meluber ke bawah kotaknya dan menimpa teks di bawahnya. Dengan membaca kotak
// baris asli, pemenggalan dan posisi vertikalnya dijamin sama dengan layar.
const textLineBoxes = (el) => {
  const range = document.createRange()
  const lines = []

  for (const node of el.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    const s = node.nodeValue
    if (!s.trim()) continue

    let cur = null
    for (let i = 0; i < s.length; i++) {
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const r = range.getBoundingClientRect()

      // Spasi di ujung baris tidak menghasilkan kotak — ikutkan ke baris berjalan
      if (!r.width && !r.height) {
        if (cur) cur.text += s[i]
        continue
      }

      if (!cur || Math.abs(r.top - cur.top) > 1) {
        cur = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, text: s[i] }
        lines.push(cur)
      } else {
        cur.text += s[i]
        cur.left = Math.min(cur.left, r.left)
        cur.right = Math.max(cur.right, r.right)
        cur.top = Math.min(cur.top, r.top)
        cur.bottom = Math.max(cur.bottom, r.bottom)
      }
    }
  }
  return lines
}

const fontOf = (cs) =>
  `${cs.fontStyle} ${cs.fontWeight} ${px(cs.fontSize)}px ${cs.fontFamily}`

const roundRectPath = (ctx, x, y, w, h, r) => {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, rr)
    return
  }
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}

// Foto lintas-origin (mis. ui-avatars.com) akan "menodai" canvas sehingga
// toBlob() gagal. Selalu muat ulang dengan crossOrigin; kalau ditolak server,
// kembalikan null supaya pemanggil menggambar lingkaran inisial secara lokal.
const loadSafeImage = (src) =>
  new Promise((resolve) => {
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => resolve(im)
    im.onerror = () => resolve(null)
    im.src = src
  })

const initialsOf = (name) =>
  (name || '?')
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

const drawCover = (ctx, img, x, y, w, h) => {
  const boxAr = w / h
  let sx = 0
  let sy = 0
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  if (sw / sh > boxAr) {
    sw = sh * boxAr
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = sw / boxAr
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

const drawBorders = (ctx, cs, x, y, w, h, radius = 0) => {
  const sides = [
    [cs.borderTopWidth, cs.borderTopColor, cs.borderTopStyle, [x, y, x + w, y]],
    [cs.borderRightWidth, cs.borderRightColor, cs.borderRightStyle, [x + w, y, x + w, y + h]],
    [cs.borderBottomWidth, cs.borderBottomColor, cs.borderBottomStyle, [x, y + h, x + w, y + h]],
    [cs.borderLeftWidth, cs.borderLeftColor, cs.borderLeftStyle, [x, y, x, y + h]],
  ]

  // Keempat sisi seragam (mis. `border: 2px solid` pada foto bulat) → satu
  // goresan mengikuti lengkung sudut, bukan empat garis lurus yang akan
  // membentuk kotak di sekeliling foto lingkaran.
  const [w0, c0, s0] = sides[0]
  const uniform = sides.every(([bw, bc, bs]) => bw === w0 && bc === c0 && bs === s0)
  const lw0 = px(w0)
  if (uniform) {
    if (lw0 <= 0 || s0 === 'none' || isTransparent(c0)) return
    ctx.save()
    ctx.strokeStyle = c0
    ctx.lineWidth = lw0
    ctx.setLineDash(s0 === 'dashed' ? [5, 4] : [])
    const i = lw0 / 2
    roundRectPath(ctx, x + i, y + i, w - lw0, h - lw0, Math.max(0, radius - i))
    ctx.stroke()
    ctx.restore()
    return
  }

  ctx.save()
  if (radius > 0) {
    roundRectPath(ctx, x, y, w, h, radius)
    ctx.clip()
  }
  for (const [width, color, style, [x1, y1, x2, y2]] of sides) {
    const lw = px(width)
    if (lw <= 0 || style === 'none' || isTransparent(color)) continue
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = lw
    ctx.setLineDash(style === 'dashed' ? [5, 4] : [])
    // Garis digambar di tengah ketebalan, jadi digeser setengahnya ke dalam kotak
    const inset = lw / 2
    const dx = x1 === x2 ? (x1 === x ? inset : -inset) : 0
    const dy = y1 === y2 ? (y1 === y ? inset : -inset) : 0
    ctx.beginPath()
    ctx.moveTo(x1 + dx, y1 + dy)
    ctx.lineTo(x2 + dx, y2 + dy)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

// Cari warna latar efektif dari leluhur terdekat yang punya background solid.
const inheritedBackground = (el) => {
  let node = el
  while (node && node !== document.documentElement) {
    const bg = getComputedStyle(node).backgroundColor
    if (!isTransparent(bg)) return bg
    node = node.parentElement
  }
  return '#ffffff'
}

/**
 * Gambar isi `wrapEl` ke canvas baru lalu unduh sebagai PNG.
 *
 * @param {HTMLElement} wrapEl   Elemen yang dipotret (mis. .chart-wrap)
 * @param {object}      opts
 * @param {boolean}     opts.transparent  true = tanpa latar belakang
 * @param {number}      opts.scale        faktor resolusi (2 = retina)
 * @param {string}      opts.title        judul opsional di atas bagan
 * @param {string}      opts.subtitle     baris kecil di bawah judul
 * @param {string}      opts.filename     nama berkas unduhan
 */
export async function exportChartPng(wrapEl, opts = {}) {
  if (!wrapEl) throw new Error('Elemen bagan belum siap.')

  const {
    transparent = false,
    scale = 2,
    title = '',
    subtitle = '',
    filename = 'struktur-desa.png',
  } = opts

  await document.fonts?.ready

  const wrapRect = wrapEl.getBoundingClientRect()
  const W = wrapRect.width
  const H = wrapRect.height
  const headerH = title ? HEADER_H : 0

  // Warna teks judul mengikuti warna nama pada kartu supaya konsisten dengan tema
  const sampleName = wrapEl.querySelector('.org-nama')
  const rootStyle = getComputedStyle(document.documentElement)
  const titleColor = sampleName ? getComputedStyle(sampleName).color : '#222222'
  const serif = rootStyle.getPropertyValue('--font-serif').trim() || 'serif'
  const sans = rootStyle.getPropertyValue('--font-sans').trim() || 'sans-serif'

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil((W + PAD * 2) * scale)
  canvas.height = Math.ceil((H + PAD * 2 + headerH) * scale)
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.textRendering = 'optimizeLegibility'

  if (!transparent) {
    ctx.fillStyle = inheritedBackground(wrapEl)
    ctx.fillRect(0, 0, W + PAD * 2, H + PAD * 2 + headerH)
  }

  if (title) {
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = titleColor
    ctx.font = `700 28px ${serif}`
    ctx.fillText(title, (W + PAD * 2) / 2, PAD + 24)
    if (subtitle) {
      ctx.globalAlpha = 0.65
      ctx.font = `500 13px ${sans}`
      ctx.fillText(subtitle, (W + PAD * 2) / 2, PAD + 58)
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }

  ctx.translate(PAD, PAD + headerH)

  // ── 1. Garis penghubung (z-index 0, digambar paling bawah) ──
  // Koordinat path relatif terhadap .chart-wrap, yang belum tentu sama dengan
  // pojok area potret (mis. saat memotret tree + panel di sampingnya), jadi
  // digeser dulu sebesar posisi SVG-nya di dalam area potret.
  const svg = wrapEl.querySelector('.chart-lines')
  if (svg) {
    const svgRect = svg.getBoundingClientRect()
    ctx.save()
    ctx.translate(svgRect.left - wrapRect.left, svgRect.top - wrapRect.top)
    for (const p of svg.querySelectorAll('path')) {
      const cs = getComputedStyle(p)
      ctx.save()
      ctx.globalAlpha = px(cs.opacity) || 1
      ctx.strokeStyle = cs.stroke
      ctx.lineWidth = px(cs.strokeWidth) || 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      const isDash =
        p.classList.contains('chart-line--dash') ||
        (cs.strokeDasharray && cs.strokeDasharray !== 'none')
      if (isDash) {
        ctx.setLineDash([6, 4])
      } else {
        ctx.setLineDash([])
      }

      ctx.stroke(new Path2D(p.getAttribute('d')))
      ctx.restore()
    }
    ctx.restore()
  }

  // ── 2. Muat semua foto lebih dulu (menggambar harus sinkron) ──
  const imgEls = [...wrapEl.querySelectorAll('img')]
  const loaded = new Map()
  await Promise.all(
    imgEls.map(async (el) => {
      loaded.set(el, await loadSafeImage(el.src))
    }),
  )

  // ── 3. Kartu, teks, dan foto (urutan DOM = urutan tumpuk yang benar di sini) ──
  for (const el of wrapEl.querySelectorAll('*')) {
    if (el.closest('.chart-lines')) continue

    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const alpha = px(cs.opacity)
    if (alpha === 0) continue

    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue

    const x = r.left - wrapRect.left
    const y = r.top - wrapRect.top
    const w = r.width
    const h = r.height
    const radius = radiusOf(cs, w, h)

    ctx.save()
    ctx.globalAlpha = alpha

    // Latar kartu (+ bayangan halus bila elemen memang punya box-shadow)
    if (!isTransparent(cs.backgroundColor)) {
      ctx.save()
      if (cs.boxShadow && cs.boxShadow !== 'none') {
        ctx.shadowColor = 'rgba(0,0,0,0.10)'
        ctx.shadowBlur = 14
        ctx.shadowOffsetY = 4
      }
      ctx.fillStyle = cs.backgroundColor
      roundRectPath(ctx, x, y, w, h, radius)
      ctx.fill()
      ctx.restore()
    }

    if (el.tagName === 'IMG') {
      const img = loaded.get(el)
      ctx.save()
      roundRectPath(ctx, x, y, w, h, radius)
      ctx.clip()
      if (img) {
        drawCover(ctx, img, x, y, w, h)
      } else {
        // Foto gagal dimuat (mis. CORS ditolak) → gambar lingkaran inisial
        ctx.fillStyle = titleColor
        ctx.globalAlpha = 0.15
        ctx.fillRect(x, y, w, h)
        ctx.globalAlpha = alpha
        ctx.fillStyle = titleColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `700 ${Math.round(h * 0.36)}px ${sans}`
        ctx.fillText(initialsOf(el.alt), x + w / 2, y + h / 2)
      }
      ctx.restore()
      drawBorders(ctx, cs, x, y, w, h, radius)
      ctx.restore()
      continue
    }

    drawBorders(ctx, cs, x, y, w, h, radius)

    // Teks langsung milik elemen ini (bukan milik anaknya). directText dipakai
    // sebagai penyaring murah lebih dulu supaya elemen wadah (tanpa teks) tidak
    // ikut menjalani pengukuran per karakter yang mahal.
    if (directText(el)) {
      ctx.fillStyle = cs.color
      ctx.font = fontOf(cs)
      // Canvas hanya menerima panjang eksplisit; 'normal' harus diabaikan.
      const spacing = cs.letterSpacing?.endsWith('px') ? cs.letterSpacing : '0px'
      if ('letterSpacing' in ctx) ctx.letterSpacing = spacing
      ctx.textBaseline = 'middle'

      const align = cs.textAlign
      ctx.textAlign =
        align === 'center' ? 'center' : align === 'right' || align === 'end' ? 'right' : 'left'

      for (const ln of textLineBoxes(el)) {
        let t = ln.text.trim()
        if (!t) continue
        if (cs.textTransform === 'uppercase') t = t.toUpperCase()
        else if (cs.textTransform === 'lowercase') t = t.toLowerCase()

        const lx =
          ctx.textAlign === 'center'
            ? (ln.left + ln.right) / 2
            : ctx.textAlign === 'right'
              ? ln.right
              : ln.left

        ctx.fillText(
          t,
          lx - wrapRect.left,
          (ln.top + ln.bottom) / 2 - wrapRect.top,
        )
      }
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    }

    ctx.restore()
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Gagal membuat berkas PNG.')

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
