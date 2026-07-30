<template>
  <div class="chart-scroll">
    <div class="chart-wrap" ref="wrapRef">
      <svg class="chart-lines" :width="size.w" :height="size.h" aria-hidden="true">
        <path
          v-for="c in connectors"
          :key="c.id"
          :d="c.d"
          :class="{ 'chart-line--dash': c.isCoordination }"
        />
      </svg>

      <div v-for="grp in tiers" :key="grp.tier" class="chart-row" :class="`chart-row--tier-${grp.tier}`">
        <div
          v-for="node in grp.nodes"
          :key="node.id"
          class="org-box"
          :class="[
            boxClass(node),
            `org-box--node-${node.id}`,
            {
              'org-box--branch-right': node.tier > 1 && parentIds.has(node.id),
              'org-box--push-right': isPushRight(node, grp.nodes),
              'rt-group-start': node.id === 104 || node.id === 106
            }
          ]"
          :ref="el => setNodeRef(node.id, el)"
        >
          <!-- Kartu gabungan Kaur & Kasi: 2 kolom dalam 1 kartu -->
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

          <!-- BPD: kedudukan sejajar Kepala Desa -->
          <template v-else-if="node.kelompok === 'bpd'">
            <span class="org-jabatan">{{ node.jabatan }}</span>
            <div class="bpd-table">
              <div v-if="node.ketua" class="bpd-ketua">
                <img
                  :src="node.ketua.foto || fallbackAvatar(node.ketua.nama)"
                  :alt="node.ketua.nama"
                  class="bpd-img"
                  @load="scheduleCompute"
                />
                <span class="bpd-jabatan bpd-jabatan--ketua">{{ node.ketua.jabatan }}</span>
                <span class="bpd-nama">{{ node.ketua.nama }}</span>
              </div>
              <div class="bpd-anggota">
                <div v-for="a in node.anggota" :key="a.nama" class="bpd-cell">
                  <img
                    :src="a.foto || fallbackAvatar(a.nama)"
                    :alt="a.nama"
                    class="bpd-img bpd-img--sm"
                    @load="scheduleCompute"
                  />
                  <span class="bpd-jabatan">{{ a.jabatan }}</span>
                  <span class="bpd-nama">{{ a.nama }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Kartu Standar (Kepala Desa, Sekretaris Desa, Staf, Kadus, RT) -->
          <template v-else>
            <span v-if="node.tier === 1" class="pf-crown">Pimpinan Tertinggi Desa</span>
            <span v-if="node.kelompok === 'rt'" class="org-dusun-badge">{{ node.dusun }}</span>
            <img
              :src="node.foto || fallbackAvatar(node.nama)"
              :alt="node.nama"
              class="org-img"
              :class="imgClass(node)"
              @load="scheduleCompute"
            />
            <span class="org-jabatan" :class="{ 'org-jabatan--sm': node.tier > 1, 'org-jabatan--rt': node.kelompok === 'rt' }">{{ node.jabatan }}</span>
            <span class="org-nama" :class="{ 'org-nama--lead': node.tier === 1, 'org-nama--sm': node.tier > 1, 'org-nama--rt': node.kelompok === 'rt' }">{{ node.nama }}</span>
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
  if (node.kelompok === 'bpd') return 'org-box--bpd'
  if (node.tier === 1) return 'org-box--kepala'
  if (node.kelompok === 'kaurkasi') return 'org-box--kaurkasi'
  if (node.kelompok === 'kadus') return 'org-box--kadus'
  if (node.kelompok === 'rt') return 'org-box--rt'
  return 'org-box--staff'
}

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const imgClass = (node) => {
  if (node.tier === 1) return 'org-img--lead'
  if (node.kelompok === 'kaur' || node.kelompok === 'kasi') return 'org-img--kaurkasi'
  if (node.kelompok === 'kadus') return 'org-img--sm'
  if (node.kelompok === 'rt') return 'org-img--rt'
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

  // 1. Garis Koordinasi Kepala Desa (id: 1) <-> BPD (id: 20)
  const kadesEl = nodeEls[1]
  const bpdEl = nodeEls[20]
  if (kadesEl && bpdEl) {
    const kRect = rectIn(kadesEl, wrapRect)
    const bRect = rectIn(bpdEl, wrapRect)

    const lineY = Math.round(kRect.top + 72)
    paths.push({
      id: 'kades-bpd-coordination',
      d: `M ${Math.round(kRect.right)} ${lineY} H ${Math.round(bRect.left)}`,
      isCoordination: true,
    })
  }

  // 2. Grouping anak berdasarkan parentId
  const parentMap = new Map()
  for (const node of props.items) {
    if (!node.parent) continue
    if (!parentMap.has(node.parent)) parentMap.set(node.parent, [])
    parentMap.get(node.parent).push(node)
  }

  const connectedIds = new Set()
  for (const [parentId, children] of parentMap.entries()) {
    connectedIds.add(parentId)
    for (const child of children) connectedIds.add(child.id)
  }

  const allRects = props.items
    .filter(n => connectedIds.has(n.id))
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

    const rowGroups = new Map()
    for (const child of children) {
      const cEl = nodeEls[child.id]
      if (!cEl) continue
      const cRect = rectIn(cEl, wrapRect)
      const cX = (cRect.left + cRect.right) / 2
      const cY = cRect.top

      const rowKey = Math.round(cY / 30) * 30
      if (!rowGroups.has(rowKey)) rowGroups.set(rowKey, { cY, items: [] })
      rowGroups.get(rowKey).items.push({ id: child.id, cX })
    }

    for (const { cY, items } of rowGroups.values()) {
      if (!items.length) continue

      const midY = pY + 18
      const allX = items.map(it => it.cX)
      const childrenMinX = Math.min(...allX)
      const childrenMaxX = Math.max(...allX)

      let d = `M ${pX} ${pY} V ${midY}`
      if (pX < childrenMinX) {
        d += ` H ${childrenMinX}`
      } else if (pX > childrenMaxX) {
        d += ` H ${childrenMaxX}`
      }

      if (items.length > 1) {
        d += ` M ${childrenMinX} ${midY} H ${childrenMaxX}`
      }

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

defineExpose({
  wrapEl: wrapRef,
  refresh: () => {
    computeConnectors()
  }
})
</script>

<style scoped>
.chart-scroll {
  width: max-content;
}

.chart-wrap {
  --chart-design-w: 1350px;
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
  opacity: 0.85;
}

.chart-line--dash {
  stroke: var(--c-terra-dark) !important;
  stroke-width: 2.2px !important;
  stroke-dasharray: 6 4 !important;
  opacity: 0.95 !important;
}

.chart-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1.5rem 1.25rem;
  margin-top: 2.5rem;
}
.chart-row:first-child { margin-top: 0; }

/* Tier 1: Kades di pertengahan antara Operator (93px) & Sekdes (540px) pada sumbu 316px (padding-left: 196px), BPD tetap di sumbu 884px (margin-left: 28rem) */
.chart-row--tier-1 {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding-left: 196px;
}
.chart-row--tier-1 .org-box--bpd {
  margin-left: 28rem;
}

/* Tier 2: Sekretaris Desa (100% tegak lurus sempurna di sumbu 540px di bawah Kepala Desa) */
.chart-row--tier-2 {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding-left: 455px;
}

/* Tier 3: Operator / Staf Desa (Paling kiri sejajar di atas Kaur & Kasi) */
.chart-row--tier-3 {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding-left: 0.5rem;
}

/* Tier 4: Kaur & Kasi + Kadus I, II, III */
.chart-row--tier-4 {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1.25rem;
  padding-left: 0.5rem;
}
.org-box--kadus {
  width: 170px;
  border-top: 3px solid var(--c-stone);
}

/*
 * Presisi alignment Kepala Dusun I, II, III di atas kelompok RT masing-masing
 * serta bebas 100% dari tabrakan dengan kartu Kaur & Kasi.
 */
.org-box--node-11 {
  margin-left: 104px !important;
}
.org-box--node-12 {
  margin-left: 124px !important;
}
.org-box--node-13 {
  margin-left: 80px !important;
}

/* Tier 5: Kartu RT — padding-left 410px menjamin garis cabang RT1 terpisah 100% dari Kaur & Kasi */
.chart-row--tier-5 {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: .55rem;
  padding-left: 410px;
}

.rt-group-start {
  margin-left: 24px !important;
}

/* ─── Boxes ── */
.org-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--c-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 1rem 0.85rem;
  width: 170px;
  flex-shrink: 0;
  transition: box-shadow .25s;
}
.org-box:hover { box-shadow: var(--shadow-lift); }

.org-img { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; margin-bottom: .4rem; border: 2px solid var(--c-cream-dark); }
.org-img--lead { width: 90px; height: 90px; border-width: 3px; }
.org-img--kaurkasi { width: 90px; height: 90px; border-width: 2.5px; }
.org-img--sm { width: 42px; height: 42px; }
.org-img--rt { width: 34px; height: 34px; border-width: 1.5px; margin-bottom: .25rem; }

.org-jabatan { font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--c-terra); text-align: center; }
.org-jabatan--sm { font-size: .58rem; }
.org-jabatan--rt { font-size: .52rem; font-weight: 700; color: var(--c-terra-dark); letter-spacing: .02em; }

.org-nama { font-family: var(--font-serif); font-size: .95rem; font-weight: 600; color: var(--c-stone); margin-top: .15rem; text-align: center; }
.org-nama--lead { font-size: 1.3rem; }
.org-nama--sm { font-size: .82rem; text-align: center; }
.org-nama--rt { font-size: .72rem; font-weight: 600; color: var(--c-stone); margin-top: .05rem; }

.org-periode { font-size: .68rem; color: var(--c-stone-muted); margin-top: .2rem; }
.org-bio { font-size: .78rem; color: var(--c-stone-muted); line-height: 1.5; margin-top: .5rem; text-align: center; }

/* Kepala Desa: box unggulan paling atas */
.org-box--kepala {
  width: 240px;
  padding: 1.5rem 1.25rem;
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

/* Kartu RT Terpisah */
.org-box--rt {
  width: 112px;
  padding: .65rem .35rem .5rem;
  border-top: 3px solid var(--c-sage);
  border-radius: var(--radius-sm);
  position: relative;
}

.org-dusun-badge {
  font-size: .48rem;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--c-white);
  background: var(--c-terra-dark);
  padding: .15rem .4rem;
  border-radius: 4px;
  margin-bottom: .3rem;
  line-height: 1;
}

/* BPD */
.org-box--bpd {
  --bpd-line: rgba(42, 33, 24, .16);

  width: 250px;
  padding: 1rem .7rem .8rem;
  border-top: 4px solid var(--c-sage);
  align-items: stretch;
  text-align: center;
}
.org-box--bpd .org-jabatan {
  display: block;
  font-size: .65rem;
  letter-spacing: .1em;
  margin-bottom: .6rem;
}

.bpd-table {
  border: 1px solid var(--bpd-line);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.bpd-ketua {
  display: flex; flex-direction: column; align-items: center;
  padding: .55rem .4rem;
  background: var(--c-cream);
  border-bottom: 1px solid var(--bpd-line);
}
.bpd-anggota {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.bpd-cell {
  display: flex; flex-direction: column; align-items: center;
  padding: .45rem .3rem;
}
.bpd-cell:nth-child(odd) { border-right: 1px solid var(--bpd-line); }
.bpd-cell:nth-child(-n + 2) { border-bottom: 1px solid var(--bpd-line); }

.bpd-img {
  width: 44px; height: 44px; border-radius: 50%;
  object-fit: cover; margin-bottom: .3rem;
  border: 2px solid var(--c-cream-dark);
}
.bpd-img--sm { width: 32px; height: 32px; border-width: 1.5px; }

.bpd-jabatan {
  font-size: .5rem; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  color: var(--c-sage);
  line-height: 1.3;
}
.bpd-jabatan--ketua { font-size: .54rem; color: var(--c-terra); }
.bpd-nama {
  font-family: var(--font-serif);
  font-size: .7rem; font-weight: 600;
  color: var(--c-stone);
  line-height: 1.3;
  margin-top: .08rem;
}
.bpd-ketua .bpd-nama { font-size: .8rem; }

.org-box--branch-right {
  margin-left: 0;
  margin-right: 0;
}
.org-box--push-right {
  margin-left: 0;
}

/* Kartu gabungan Kaur & Kasi */
.org-box--kaurkasi {
  width: 380px;
  border-top: 3px solid var(--c-terra);
  align-items: stretch;
  flex-shrink: 0;
}
.kk-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1rem;
  margin-top: .5rem;
  padding-top: .5rem;
  border-top: 1px dashed var(--c-cream-dark);
}
.kk-col { display: flex; flex-direction: column; gap: .65rem; }
.kk-col:first-child { border-right: 1px dashed var(--c-cream-dark); padding-right: .75rem; }
.kk-col:last-child { padding-left: .25rem; }
.kk-col-title {
  font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  margin-bottom: .1rem;
}
.kk-col-title--kaur { color: var(--c-terra); }
.kk-col-title--kasi { color: var(--c-sage); }
.kk-person { display: flex; align-items: center; gap: .5rem; }
.kk-person-img {
  width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
  flex-shrink: 0; border: 2px solid var(--c-cream-dark);
}
.kk-person-text { display: flex; flex-direction: column; min-width: 0; }
.kk-person-jabatan { font-size: .66rem; font-weight: 600; color: var(--c-stone); line-height: 1.25; }
.kk-person-nama { font-size: .74rem; color: var(--c-stone-muted); font-family: var(--font-serif); }
</style>
