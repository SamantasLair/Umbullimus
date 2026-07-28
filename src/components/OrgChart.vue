<template>
  <div class="chart-wrap" ref="wrapRef">
    <svg class="chart-lines" :width="size.w" :height="size.h" aria-hidden="true">
      <path v-for="c in connectors" :key="c.id" :d="c.d" />
    </svg>

    <div v-for="grp in tiers" :key="grp.tier" class="chart-row">
      <div
        v-for="node in grp.nodes"
        :key="node.id"
        class="org-box"
        :class="boxClass(node)"
        :ref="el => setNodeRef(node.id, el)"
      >
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
  if (node.kelompok === 'kaur') return 'org-box--kaur'
  if (node.kelompok === 'kasi') return 'org-box--kasi'
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

      // Celah pertengahan antara induk dan baris anak ini
      let midY = pY + (cY - pY) * 0.5
      if (cY <= pY) midY = pY + 18

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
.org-box--kaur  { border-top: 3px solid var(--c-terra); }
.org-box--kasi  { border-top: 3px solid var(--c-sage); }
.org-box--kadus { border-top: 3px solid var(--c-stone); }

@media (max-width: 480px) {
  .org-box { width: 100%; max-width: 220px; padding: .9rem .75rem; }
  .org-box--kepala { max-width: 240px; padding: 1.5rem 1.25rem; }
}
</style>
