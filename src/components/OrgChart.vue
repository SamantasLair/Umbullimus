<template>
  <div class="chart-scroll">
    <div class="chart-wrap" ref="wrapRef">
      <svg class="chart-lines" :width="size.w" :height="size.h" aria-hidden="true">
        <path v-for="c in connectors" :key="c.id" :d="c.d" />
      </svg>

      <div v-for="grp in tiers" :key="grp.tier" class="chart-row" :class="`chart-row--tier-${grp.tier}`">
        <!-- Kartu gabungan Kaur & Kasi: 2 kolom dalam 1 kartu (kiri Kaur, kanan Kasi) -->
        <div
          v-for="node in grp.nodes"
          :key="node.id"
          class="org-box"
          :class="[
            boxClass(node),
            {
              'org-box--branch-right': node.tier > 1 && parentIds.has(node.id),
              'org-box--push-right': isPushRight(node, grp.nodes)
            }
          ]"
          :ref="el => setNodeRef(node.id, el)"
        >
          <template v-if="node.kelompok === 'kaurkasi'">
            <span class="org-jabatan">Kaur &amp; Kasi</span>
            <div class="kk-columns">
              <div class="kk-col">
                <span class="kk-col-title kk-col-title--kaur">Kaur</span>
                <div v-for="p in node.kaur" :key="p.jabatan" class="kk-person">
                  <img :src="p.foto || fallbackAvatar(p.nama)" :alt="p.nama" class="kk-person-img" />
                  <div class="kk-person-text">
                    <span class="kk-person-jabatan">{{ p.jabatan }}</span>
                    <span class="kk-person-nama">{{ p.nama }}</span>
                  </div>
                </div>
              </div>
              <div class="kk-col">
                <span class="kk-col-title kk-col-title--kasi">Kasi</span>
                <div v-for="p in node.kasi" :key="p.jabatan" class="kk-person">
                  <img :src="p.foto || fallbackAvatar(p.nama)" :alt="p.nama" class="kk-person-img" />
                  <div class="kk-person-text">
                    <span class="kk-person-jabatan">{{ p.jabatan }}</span>
                    <span class="kk-person-nama">{{ p.nama }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <span v-if="node.tier === 1" class="pf-crown">Pimpinan Tertinggi Desa</span>
            <img
              :src="node.foto || fallbackAvatar(node.nama)"
              :alt="node.nama"
              class="org-img"
              :class="imgClass(node)"
              @load="scheduleCompute"
            />
            <span class="org-jabatan" :class="{ 'org-jabatan--sm': node.tier > 1 }">{{ node.jabatan }}</span>
            <span class="org-nama" :class="{ 'org-nama--lead': node.tier === 1, 'org-nama--sm': node.tier > 1 }">{{ node.nama }}</span>
            <span v-if="node.periode" class="org-periode">{{ node.periode }}</span>
            <p v-if="node.bio" class="org-bio">{{ node.bio }}</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { exportChartPng } from '../composables/useChartExport.js'
// biome-ignore lint/correctness/noUnusedImports: Used in template
import { fallbackAvatar, groupByTier } from '../composables/useOrgTree.js'

const props = defineProps({
  items: { type: Array, required: true },
})

const wrapRef = ref(null)
const nodeEls = {}
const size = ref({ w: 0, h: 0 })
const connectors = ref([])

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const tiers = computed(() => groupByTier(props.items))

// Id yang jadi induk dari orang lain (punya cabang sendiri) — dipakai untuk
// menggeser kartunya ke kanan dalam barisnya (mis. Sekdes), supaya garis
// komandonya ke bawah (mis. ke Kadus) tidak menabrak kartu/garis lain yang
// kebetulan sebaris (mis. Bendahara & Operator).
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const parentIds = computed(() => new Set(props.items.filter(n => n.parent).map(n => n.parent)))

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const isPushRight = (node, groupNodes) => {
  if (node.kelompok !== 'kadus') return false
  const firstKadus = groupNodes.find(n => n.kelompok === 'kadus')
  return firstKadus && firstKadus.id === node.id
}

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const setNodeRef = (id, el) => {
  if (el) nodeEls[id] = el
}

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const boxClass = (node) => {
  if (node.tier === 1) return 'org-box--kepala'
  if (node.kelompok === 'kaurkasi') return 'org-box--kaurkasi'
  if (node.kelompok === 'kadus') return 'org-box--kadus'
  return 'org-box--staff'
}

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const imgClass = (node) => {
  if (node.tier === 1) return 'org-img--lead'
  if (node.kelompok === 'kaur' || node.kelompok === 'kasi') return 'org-img--kaurkasi'
  if (node.kelompok === 'kadus') return 'org-img--sm'
  return ''
}

const rectIn = (el, wrapRect) => {
  const r = el.getBoundingClientRect()
  return {
    left: r.left - wrapRect.left,
    right: r.right - wrapRect.left,
    top: r.top - wrapRect.top,
    bottom: r.bottom - wrapRect.top,
  }
}

const DODGE_PAD = 16

// Segmen turun vertikal (dari fromY ke toY, pada sumbu cX) yang otomatis memutar
// kalau ada kotak LAIN (bukan induk/anak grup ini sendiri) menghalangi jalurnya —
// mis. garis Sekdes → Kadus yang harus melewati baris Bendahara/Operator.
const dropSegment = (cX, fromY, toY, obstacles) => {
  const blocking = obstacles.filter(
    b => b.top < toY - 1 && b.bottom > fromY + 1 && cX > b.left - DODGE_PAD && cX < b.right + DODGE_PAD,
  )
  if (!blocking.length) return `M ${cX} ${fromY} V ${toY}`

  const minLeft = Math.min(...blocking.map(b => b.left))
  const maxRight = Math.max(...blocking.map(b => b.right))
  const minTop = Math.min(...blocking.map(b => b.top))
  const maxBottom = Math.max(...blocking.map(b => b.bottom))

  const leftX = minLeft - DODGE_PAD
  const rightX = maxRight + DODGE_PAD
  const dodgeX = Math.abs(cX - leftX) <= Math.abs(cX - rightX) ? leftX : rightX
  const preY = Math.max(fromY, minTop - DODGE_PAD)
  const postY = Math.min(toY, maxBottom + DODGE_PAD)

  return `M ${cX} ${fromY} V ${preY} H ${dodgeX} V ${postY} H ${cX} V ${toY}`
}

const computeConnectors = () => {
  const wrap = wrapRef.value
  if (!wrap) return

  const wrapRect = wrap.getBoundingClientRect()
  size.value = { w: wrapRect.width, h: wrapRect.height }

  const paths = []

  // Grouping anak berdasarkan parentId
  const parentMap = new Map()
  for (const node of props.items) {
    if (!node.parent) continue
    if (!parentMap.has(node.parent)) parentMap.set(node.parent, [])
    parentMap.get(node.parent).push(node)
  }

  // Rect semua kotak (dipakai sebagai daftar "penghalang" saat garis anak tertentu
  // harus melewati baris tingkat lain yang bukan induk/saudaranya sendiri).
  const allRects = props.items
    .map(n => ({ id: n.id, rect: nodeEls[n.id] && rectIn(nodeEls[n.id], wrapRect) }))
    .filter(r => r.rect)

  for (const [parentId, children] of parentMap.entries()) {
    const parentEl = nodeEls[parentId]
    if (!parentEl) continue

    const pRect = rectIn(parentEl, wrapRect)
    const pX = (pRect.left + pRect.right) / 2
    const pY = pRect.bottom

    const ownIds = new Set([parentId, ...children.map(c => c.id)])
    const obstacles = allRects.filter(r => !ownIds.has(r.id)).map(r => r.rect)

    // Kelompokkan anak berdasarkan posisi baris vertikal (tier/row)
    const rowGroups = new Map()
    for (const child of children) {
      const cEl = nodeEls[child.id]
      if (!cEl) continue
      const cRect = rectIn(cEl, wrapRect)
      const cX = (cRect.left + cRect.right) / 2
      const cY = cRect.top

      // Bulatkan cY ke kelipatan 30px untuk mengelompokkan anak di baris visual yang sama
      const rowKey = Math.round(cY / 30) * 30
      if (!rowGroups.has(rowKey)) rowGroups.set(rowKey, { cY, items: [] })
      rowGroups.get(rowKey).items.push({ id: child.id, cX })
    }

    for (const { cY, items } of rowGroups.values()) {
      if (!items.length) continue

      // Bus bar dibuat SEGERA di bawah induk (bukan pertengahan) — supaya kalau
      // ada anak yang "melompati" beberapa tingkat (mis. Bendahara/Operator yang
      // levelnya di bawah Sekretaris tapi sama-sama anak Kepala Desa), garisnya
      // sudah menyamping dulu SEBELUM masuk ke baris tingkat yang dilewati,
      // supaya tidak menembus kartu tingkat tersebut.
      const midY = pY + 18

      // Jika hanya ada 1 anak dan letak X-nya sama persis dengan induk: buat garis lurus
      if (items.length === 1 && Math.abs(items[0].cX - pX) < 3) {
        paths.push({
          id: `${parentId}-${items[0].id}`,
          d: dropSegment(pX, pY, cY, obstacles),
        })
        continue
      }

      // Cari batas X terkiri & terkanan untuk membuat 1 bus bar horizontal bersama
      const allX = items.map(it => it.cX)
      const minX = Math.min(pX, ...allX)
      const maxX = Math.max(pX, ...allX)

      // Jalur tunggal induk -> bus bar -> cabang anak (tiap cabang mengecek sendiri
      // apakah perlu memutar kalau ada kotak lain menghalangi turunannya)
      let d = `M ${pX} ${pY} V ${midY} M ${minX} ${midY} H ${maxX}`
      for (const it of items) {
        d += ` ${dropSegment(it.cX, midY, cY, obstacles)}`
      }

      paths.push({
        id: `${parentId}-row-${Math.round(cY)}`,
        d,
      })
    }
  }

  connectors.value = paths
}

let resizeObserver
let rafId

const scheduleCompute = () => {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(computeConnectors)
}

onMounted(async () => {
  await nextTick()
  scheduleCompute()

  requestAnimationFrame(scheduleCompute)
  setTimeout(scheduleCompute, 100)
  setTimeout(scheduleCompute, 400)
  document.fonts?.ready?.then(scheduleCompute)

  resizeObserver = new ResizeObserver(scheduleCompute)
  if (wrapRef.value) resizeObserver.observe(wrapRef.value)
  window.addEventListener('resize', scheduleCompute)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleCompute)
  cancelAnimationFrame(rafId)
})

// Ekspor PNG: pastikan garis penghubung sudah dihitung ulang untuk ukuran
// terkini sebelum dipotret, supaya hasil unduhan tidak memakai koordinat basi.
const exportPng = async (options) => {
  computeConnectors()
  await nextTick()
  return exportChartPng(wrapRef.value, options)
}

defineExpose({ exportPng })
</script>

<style scoped>
/* Bagan dikunci pada lebar desain tetap (--chart-design-w) supaya susunan
   percabangannya PERSIS SAMA di semua ukuran layar — di layar sempit yang
   terjadi hanyalah geser mendatar, bukan tata letak yang menyusun ulang diri
   dan merusak hubungan induk-anak. */
.chart-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: .5rem;
}

.chart-wrap {
  --chart-design-w: 1200px;
  position: relative;
  width: var(--chart-design-w);
  padding-left: 0;
}

.chart-lines {
  position: absolute;
  top: 0; left: 0;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
}
.chart-lines path {
  fill: none;
  stroke: var(--c-terra);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  opacity: 0.8;
}

.chart-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem 1.25rem;
  margin-top: 3.5rem;
}
.chart-row:first-child { margin-top: 0; }
.chart-row--tier-3 {
  justify-content: flex-start;
  padding-left: 0.5rem;
  gap: 3.75rem;
}

/* ─── Boxes ── */
.org-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--c-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 1.1rem 1rem;
  width: 180px;
  transition: box-shadow .25s;
}
.org-box:hover { box-shadow: var(--shadow-lift); }

.org-img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; margin-bottom: .5rem; border: 2px solid var(--c-cream-dark); }
.org-img--lead { width: 96px; height: 96px; border-width: 3px; }
.org-img--kaurkasi { width: 96px; height: 96px; border-width: 2.5px; }
.org-img--sm { width: 44px; height: 44px; }

.org-jabatan { font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--c-terra); text-align: center; }
.org-jabatan--sm { font-size: .58rem; }
.org-nama { font-family: var(--font-serif); font-size: 1rem; font-weight: 600; color: var(--c-stone); margin-top: .15rem; text-align: center; }
.org-nama--lead { font-size: 1.35rem; }
.org-nama--sm { font-size: .82rem; text-align: center; }
.org-periode { font-size: .68rem; color: var(--c-stone-muted); margin-top: .2rem; }
.org-bio { font-size: .8rem; color: var(--c-stone-muted); line-height: 1.6; margin-top: .6rem; text-align: center; }

/* Kepala Desa: box unggulan paling atas */
.org-box--kepala {
  width: 250px;
  padding: 1.75rem 1.5rem;
  border-top: 5px solid var(--c-terra-dark);
  box-shadow: var(--shadow-lift);
}
.pf-crown {
  display: inline-block;
  font-size: .6rem; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase;
  color: var(--c-white);
  background: var(--c-terra-dark);
  padding: .3rem .75rem;
  border-radius: 50px;
  margin-bottom: .6rem;
}

.org-box--staff { border-top: 3px solid var(--c-stone-muted); }
.org-box--kadus { border-top: 3px solid var(--c-stone); }

/* Node yang punya cabang sendiri (mis. Sekdes) digeser ke kanan barisnya dan
   disepadankan posisinya di atas Kepala Dusun II (anak tengahnya). */
.org-box--branch-right {
  margin-left: auto;
  margin-right: calc(180px + 1.25rem);
}
.org-box--push-right {
  margin-left: auto;
}

/* Kartu gabungan Kaur & Kasi: 2 kolom dalam 1 kartu, kiri Kaur - kanan Kasi */
.org-box--kaurkasi {
  width: 420px;
  border-top: 3px solid var(--c-terra);
  align-items: stretch;
}
.kk-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1rem;
  margin-top: .6rem;
  padding-top: .6rem;
  border-top: 1px dashed var(--c-cream-dark);
}
.kk-col { display: flex; flex-direction: column; gap: .75rem; }
.kk-col:first-child { border-right: 1px dashed var(--c-cream-dark); padding-right: 1rem; }
.kk-col:last-child { padding-left: .5rem; }
.kk-col-title {
  font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  margin-bottom: .1rem;
}
.kk-col-title--kaur { color: var(--c-terra); }
.kk-col-title--kasi { color: var(--c-sage); }
.kk-person { display: flex; align-items: center; gap: .6rem; }
.kk-person-img {
  width: 48px; height: 48px; border-radius: 50%; object-fit: cover;
  flex-shrink: 0; border: 2px solid var(--c-cream-dark);
}
.kk-person-text { display: flex; flex-direction: column; min-width: 0; }
.kk-person-jabatan { font-size: .68rem; font-weight: 600; color: var(--c-stone); line-height: 1.3; }
.kk-person-nama { font-size: .75rem; color: var(--c-stone-muted); font-family: var(--font-serif); }

/* Sengaja TIDAK ada media query yang mengubah ukuran kartu, flex-wrap, atau
   margin --branch-right/--push-right. Override semacam itu membuat bagan
   menyusun ulang diri di layar sempit sehingga garis komando tidak lagi
   sejajar dengan kartunya. Bagan tetap pada lebar desainnya dan digeser
   mendatar di dalam .chart-scroll. */
</style>
