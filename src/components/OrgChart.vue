<template>
  <div class="chart-wrap" ref="wrapRef">
    <svg class="chart-lines" :width="size.w" :height="size.h" aria-hidden="true">
      <path v-for="c in connectors" :key="c.id" :d="c.d" />
    </svg>

    <div v-for="grp in tiers" :key="grp.tier" class="chart-row">
      <!-- Kartu gabungan Kaur & Kasi: 2 kolom dalam 1 kartu (kiri Kaur, kanan Kasi) -->
      <div
        v-for="node in grp.nodes"
        :key="node.id"
        class="org-box"
        :class="boxClass(node)"
        :ref="el => setNodeRef(node.id, el)"
      >
        <template v-if="node.kelompok === 'kaurkasi'">
          <span class="org-jabatan">Kaur &amp; Kasi</span>
          <div class="kk-columns">
            <div class="kk-col">
              <span class="kk-col-title kk-col-title--kaur">Kaur</span>
              <div v-for="p in node.kaur" :key="p.jabatan" class="kk-person">
                <span class="kk-person-jabatan">{{ p.jabatan }}</span>
                <span class="kk-person-nama">{{ p.nama }}</span>
              </div>
            </div>
            <div class="kk-col">
              <span class="kk-col-title kk-col-title--kasi">Kasi</span>
              <div v-for="p in node.kasi" :key="p.jabatan" class="kk-person">
                <span class="kk-person-jabatan">{{ p.jabatan }}</span>
                <span class="kk-person-nama">{{ p.nama }}</span>
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
          />
          <span class="org-jabatan" :class="{ 'org-jabatan--sm': node.tier > 1 }">{{ node.jabatan }}</span>
          <span class="org-nama" :class="{ 'org-nama--lead': node.tier === 1, 'org-nama--sm': node.tier > 1 }">{{ node.nama }}</span>
          <span v-if="node.periode" class="org-periode">{{ node.periode }}</span>
          <p v-if="node.bio" class="org-bio">{{ node.bio }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
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

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const imgClass = (node) => {
  if (node.tier === 1) return 'org-img--lead'
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

  for (const [parentId, children] of parentMap.entries()) {
    const parentEl = nodeEls[parentId]
    if (!parentEl) continue

    const pRect = rectIn(parentEl, wrapRect)
    const pX = (pRect.left + pRect.right) / 2
    const pY = pRect.bottom

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
          d: `M ${pX} ${pY} V ${cY}`,
        })
        continue
      }

      // Cari batas X terkiri & terkanan untuk membuat 1 bus bar horizontal bersama
      const allX = items.map(it => it.cX)
      const minX = Math.min(pX, ...allX)
      const maxX = Math.max(pX, ...allX)

      // Jalur tunggal induk -> bus bar -> cabang anak
      let d = `M ${pX} ${pY} V ${midY} M ${minX} ${midY} H ${maxX}`
      for (const it of items) {
        d += ` M ${it.cX} ${midY} V ${cY}`
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
  computeConnectors()

  resizeObserver = new ResizeObserver(scheduleCompute)
  if (wrapRef.value) resizeObserver.observe(wrapRef.value)
  window.addEventListener('resize', scheduleCompute)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleCompute)
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.chart-wrap {
  position: relative;
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

/* Kartu gabungan Kaur & Kasi: 2 kolom dalam 1 kartu, kiri Kaur - kanan Kasi */
.org-box--kaurkasi {
  width: 320px;
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
.kk-col { display: flex; flex-direction: column; gap: .55rem; }
.kk-col:first-child { border-right: 1px dashed var(--c-cream-dark); padding-right: .75rem; }
.kk-col:last-child { padding-left: .25rem; }
.kk-col-title {
  font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  margin-bottom: .1rem;
}
.kk-col-title--kaur { color: var(--c-terra); }
.kk-col-title--kasi { color: var(--c-sage); }
.kk-person { display: flex; flex-direction: column; }
.kk-person-jabatan { font-size: .62rem; font-weight: 600; color: var(--c-stone); line-height: 1.3; }
.kk-person-nama { font-size: .68rem; color: var(--c-stone-muted); font-family: var(--font-serif); }

@media (max-width: 480px) {
  .org-box { width: 100%; max-width: 220px; padding: .9rem .75rem; }
  .org-box--kepala { max-width: 240px; padding: 1.5rem 1.25rem; }
  .org-box--kaurkasi { max-width: 280px; }
  .kk-columns { grid-template-columns: 1fr; }
  .kk-col:first-child { border-right: none; padding-right: 0; border-bottom: 1px dashed var(--c-cream-dark); padding-bottom: .5rem; }
}
</style>
