<template>
  <div class="chart-scroll">
    <div class="chart-wrap" ref="wrapRef">
      <svg class="chart-lines" :width="size.w" :height="size.h" aria-hidden="true">
        <path v-for="c in connectors" :key="c.id" :d="c.d" />
      </svg>

      <div v-for="grp in tiers" :key="grp.tier" class="chart-row">
        <div
          v-for="sub in grp.subGroups"
          :key="sub.parentId"
          class="chart-subgroup"
          :class="{ 'chart-subgroup--right': sub.isRightBranch }"
        >
          <div
            v-for="node in sub.nodes"
            :key="node.id"
            class="org-box"
            :class="[boxClass(node), { 'org-box--branch-right': node.tier > 1 && parentIds.has(node.id) }]"
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
const tiers = computed(() => {
  const rawTiers = groupByTier(props.items)
  return rawTiers.map(grp => {
    const parentMap = new Map()
    for (const node of grp.nodes) {
      const pId = node.parent || 0
      if (!parentMap.has(pId)) parentMap.set(pId, [])
      parentMap.get(pId).push(node)
    }

    const subGroups = [...parentMap.entries()].map(([parentId, nodes]) => ({
      parentId,
      nodes,
      isRightBranch: parentId === 2,
    }))

    return {
      tier: grp.tier,
      subGroups,
    }
  })
})

// Id yang jadi induk dari orang lain (punya cabang sendiri)
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const parentIds = computed(() => new Set(props.items.filter(n => n.parent).map(n => n.parent)))

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

      const rowKey = Math.round(cY / 30) * 30
      if (!rowGroups.has(rowKey)) rowGroups.set(rowKey, { cY, items: [] })
      rowGroups.get(rowKey).items.push({ id: child.id, cX })
    }

    for (const { cY, items } of rowGroups.values()) {
      if (!items.length) continue

      let midY = pY + (cY - pY) * 0.5
      if (cY <= pY) midY = pY + 18

      if (items.length === 1 && Math.abs(items[0].cX - pX) < 3) {
        paths.push({
          id: `${parentId}-${items[0].id}`,
          d: `M ${pX} ${pY} V ${cY}`,
        })
        continue
      }

      const allX = items.map(it => it.cX)
      const minX = Math.min(pX, ...allX)
      const maxX = Math.max(pX, ...allX)

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
.chart-scroll {
  width: 100%;
}

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

.chart-subgroup {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}
.chart-subgroup--right {
  margin-left: auto;
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

/* Node yang punya cabang sendiri (mis. Sekdes) digeser ke kanan barisnya,
   supaya garis komandonya ke bawah tidak menabrak kartu/garis lain yang
   kebetulan sebaris (mis. Bendahara & Operator). */
.org-box--branch-right { margin-left: auto; }

/* Kartu gabungan Kaur & Kasi: 2 kolom dalam 1 kartu, foto profil 48px (2x lebih besar) */
.org-box--kaurkasi {
  width: 520px;
  border-top: 3px solid var(--c-terra);
  align-items: stretch;
}
.kk-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1.25rem;
  margin-top: .6rem;
  padding-top: .6rem;
  border-top: 1px dashed var(--c-cream-dark);
}
.kk-col { display: flex; flex-direction: column; gap: .75rem; }
.kk-col:first-child { border-right: 1px dashed var(--c-cream-dark); padding-right: 1rem; }
.kk-col:last-child { padding-left: .5rem; }
.kk-col-title {
  font-size: .68rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  margin-bottom: .2rem;
}
.kk-col-title--kaur { color: var(--c-terra); }
.kk-col-title--kasi { color: var(--c-sage); }
.kk-person { display: flex; align-items: center; gap: .75rem; }
.kk-person-img {
  width: 48px; height: 48px; border-radius: 50%; object-fit: cover;
  flex-shrink: 0; border: 2px solid var(--c-cream-dark);
}
.kk-person-text { display: flex; flex-direction: column; min-width: 0; }
.kk-person-jabatan { font-size: .72rem; font-weight: 600; color: var(--c-stone); line-height: 1.3; }
.kk-person-nama { font-size: .78rem; color: var(--c-stone-muted); font-family: var(--font-serif); }

@media (max-width: 640px) {
  .chart-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: .5rem;
  }
  .chart-row {
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 1.25rem .9rem;
  }
  .org-box { width: 128px; padding: .8rem .6rem; flex-shrink: 0; }
  .org-box--kepala { width: 190px; padding: 1.25rem 1rem; flex-shrink: 0; }
  .org-box--kaurkasi { width: 340px; flex-shrink: 0; }
  .org-box--branch-right { margin-left: 0; }

  .org-img { width: 44px; height: 44px; }
  .org-img--lead { width: 68px; height: 68px; }
  .org-img--sm { width: 34px; height: 34px; }
  .org-bio { display: none; }
  .kk-person-img { width: 36px; height: 36px; }
}
</style>
