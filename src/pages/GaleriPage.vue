<template>
  <main class="galeri-page">
    <!-- Page Header -->
    <header class="galeri-hero" ref="headerEl">
      <div class="galeri-hero-overlay"></div>
      <div class="galeri-hero-content">
        <span class="galeri-label" ref="labelEl">Galeri Foto</span>
        <h1 class="galeri-title" ref="titleEl">
          Keindahan <em>Umbul Limus</em>
        </h1>
        <p class="galeri-tagline" ref="taglineEl">
          Koleksi momen dan panorama alam, budaya, serta kehidupan masyarakat Desa Umbul Limus.
        </p>
        <!-- Filter kategori -->
        <div class="galeri-filters" ref="filterEl">
          <button
            v-for="cat in categories"
            :key="cat"
            class="filter-btn"
            :class="{ 'filter-btn--active': activeFilter === cat }"
            @click="setFilter(cat)"
          >{{ cat }}</button>
        </div>
      </div>
    </header>

    <!-- Bento Grid -->
    <section class="galeri-section" ref="sectionRef">
      <div class="galeri-container">
        <!-- Skeleton -->
        <div v-if="loading" class="bento-skeleton-grid" aria-label="Memuat galeri...">
          <div v-for="n in 9" :key="n" class="skeleton-box bento-skeleton-item"></div>
        </div>

        <!-- Error -->
        <div v-else-if="!filteredImages.length" class="galeri-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>Belum ada foto untuk kategori ini.</p>
        </div>

        <!-- Bento Grid -->
        <div v-else class="bento-grid" ref="gridEl">
          <figure
            v-for="(img, i) in filteredImages"
            :key="img.src + i"
            class="bento-item"
            :class="getBentoClass(i)"
            :ref="el => { if(el) itemRefs[i] = el }"
            @click="openLightbox(i)"
            @mouseenter="onEnter"
            @mouseleave="onLeave"
            :aria-label="`Buka foto: ${img.alt}`"
            role="button"
            tabindex="0"
            @keydown.enter="openLightbox(i)"
          >
            <img
              :src="img.src"
              :alt="img.alt"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span class="bento-caption-title">{{ img.alt }}</span>
              <span v-if="img.kategori" class="bento-caption-cat">{{ img.kategori }}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- Lightbox (native <dialog>) -->
    <dialog
      class="lightbox"
      ref="dialogEl"
      @click.self="closeLightbox"
      @keydown.escape="closeLightbox"
    >
      <div class="lightbox-inner" v-if="lightboxIndex !== null">
        <button class="lb-close" @click="closeLightbox" aria-label="Tutup">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button class="lb-prev" @click="prevImage" aria-label="Foto sebelumnya" v-if="filteredImages.length > 1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="lb-img-wrap">
          <img
            :src="filteredImages[lightboxIndex]?.src"
            :alt="filteredImages[lightboxIndex]?.alt"
            class="lb-img"
            loading="eager"
          />
        </div>
        <button class="lb-next" @click="nextImage" aria-label="Foto berikutnya" v-if="filteredImages.length > 1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="lb-caption">
          <span class="lb-title">{{ filteredImages[lightboxIndex]?.alt }}</span>
          <span class="lb-counter">{{ lightboxIndex + 1 }} / {{ filteredImages.length }}</span>
        </div>
      </div>
    </dialog>
  </main>
</template>

<script setup>
import anime from 'animejs'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useCardHover } from '../composables/useCardHover.js'
import { useScrollExit } from '../composables/useScrollExit.js'

const { onEnter, onLeave } = useCardHover({ lift: -6, scale: 1.015 })

// ─── State ────────────────────────────────────────────────────────────────────
const allImages   = ref([])
const loading     = ref(true)
const activeFilter = ref('Semua')
const lightboxIndex = ref(null)

const sectionRef = ref(null)
const headerEl = ref(null)
const labelEl  = ref(null)
const titleEl  = ref(null)
const taglineEl = ref(null)
const filterEl = ref(null)
const gridEl   = ref(null)
const dialogEl = ref(null)
const itemRefs = ref([])

// ─── 8 Pola Bento Non-Monoton ─────────────────────────────────────────────────
// Siklus 12 item menghasilkan 2 "baris" layout yang berbeda visual
const BENTO_PATTERN = [
  'bento-featured',  // 0: col 1-2, row 1-2
  'bento-tall',      // 1: col 3, row 1-2
  'bento-wide',      // 2: col 1-2, row 3
  'bento-square',    // 3: col 3, row 3
  'bento-square',    // 4: col 1, row 4
  'bento-panorama',  // 5: col 1-3, row 4 (dikontrol via class)
  'bento-square',    // 6: col 1, row 5
  'bento-tall',      // 7: col 2, row 5-6
  'bento-square',    // 8: col 3, row 5
  'bento-wide',      // 9: col 1+2, row 6 (auto-fill)
  'bento-square',    // 10: col 3, row 6
  'bento-featured',  // 11: col 2-3, row 7-8
]

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const getBentoClass = i => BENTO_PATTERN[i % BENTO_PATTERN.length]

// ─── Kategori & Filter ────────────────────────────────────────────────────────
const categories = computed(() => {
  const cats = new Set(allImages.value.map(img => img.kategori).filter(Boolean))
  return ['Semua', ...cats]
})

const filteredImages = computed(() => {
  if (activeFilter.value === 'Semua') return allImages.value
  return allImages.value.filter(img => img.kategori === activeFilter.value)
})

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const setFilter = async (cat) => {
  activeFilter.value = cat
  await nextTick()
  animateGrid()
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const openLightbox = (i) => {
  lightboxIndex.value = i
  dialogEl.value?.showModal()
  document.body.style.overflow = 'hidden'
}

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const closeLightbox = () => {
  dialogEl.value?.close()
  lightboxIndex.value = null
  document.body.style.overflow = ''
}

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const nextImage = () => {
  lightboxIndex.value = (lightboxIndex.value + 1) % filteredImages.value.length
}

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const prevImage = () => {
  const len = filteredImages.value.length
  lightboxIndex.value = (lightboxIndex.value - 1 + len) % len
}

// Keyboard navigation inside lightbox
const handleKey = (e) => {
  if (lightboxIndex.value === null) return
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

// ─── Grid Animation ───────────────────────────────────────────────────────────
const animateGrid = async () => {
  await nextTick()
  const items = itemRefs.value.filter(Boolean)
  if (!items.length) return

  anime.remove(items)
  anime({
    targets: items,
    opacity: [0, 1],
    scale: [0.9, 1],
    translateY: [20, 0],
    delay: anime.stagger(55),
    duration: 600,
    easing: 'easeOutExpo',
  })
}

// Exit: item bento menyebar & naik saat section dilewati ke atas
useScrollExit(
  sectionRef,
  () => itemRefs.value.filter(Boolean).map((el, i) => ({
    el, x: (i % 3 - 1) * 30, y: -90 - (i % 3) * 12, scale: 0.93,
  })),
  { exitZone: 300, staggerPx: 8 },
)

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('keydown', handleKey)

  // Header entrance animation
  anime.timeline({ easing: 'easeOutExpo' })
    .add({
      targets: labelEl.value,
      clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
      opacity: [0, 1],
      duration: 700,
      delay: 200,
      easing: 'easeInOutQuart',
    })
    .add({
      targets: titleEl.value,
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 800,
    }, '-=400')
    .add({
      targets: taglineEl.value,
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 700,
    }, '-=500')
    .add({
      targets: filterEl.value?.querySelectorAll('.filter-btn'),
      opacity: [0, 1],
      translateY: [10, 0],
      scale: [0.92, 1],
      delay: anime.stagger(70),
      duration: 500,
      easing: 'easeOutBack',
    }, '-=400')

  // Load images
  try {
    const res = await fetch('/images/galeri/manifest.json')
    if (res.ok) {
      const data = await res.json()
      allImages.value = data.images || []
    }
  } catch {
    // Fallback ke gallery/list.json
    try {
      const res2 = await fetch('/data/gallery/list.json')
      if (res2.ok) {
        const data = await res2.json()
        allImages.value = data.map(d => ({
          src: d.gambar,
          alt: d.judul,
          kategori: 'alam'
        }))
      }
    } catch (e) {
      console.error('Gagal memuat galeri:', e)
    }
  } finally {
    loading.value = false
  }

  await nextTick()
  animateGrid()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ─── Page Layout ─────────────────────────────────────────────── */
.galeri-page {
  background: var(--c-cream);
  min-height: 100vh;
}

/* ─── Hero Header ─────────────────────────────────────────────── */
.galeri-hero {
  position: relative;
  background: linear-gradient(135deg, var(--c-stone) 0%, #142d0e 60%, #0a1a07 100%);
  padding: 8rem var(--sp-md) 5rem;
  overflow: hidden;
}
.galeri-hero::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 70% 40%, rgba(212,168,83,0.12) 0%, transparent 55%);
  pointer-events: none;
}
.galeri-hero-overlay {
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.04;
  background-size: 200px;
  pointer-events: none;
}
.galeri-hero-content {
  position: relative; z-index: 1;
  max-width: var(--max-w);
  margin: 0 auto;
}

.galeri-label {
  display: inline-block;
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--c-siger);
  border: 1px solid rgba(212,168,83,0.3);
  padding: 0.3rem 0.8rem; border-radius: 50px;
  margin-bottom: 1.25rem;
  opacity: 0;
}
.galeri-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  color: var(--c-cream);
  line-height: 1.1;
  margin-bottom: 1rem;
  opacity: 0;
}
.galeri-title em { font-style: italic; color: var(--c-sage-light); }
.galeri-tagline {
  font-size: 1rem;
  color: rgba(237,250,233,0.6);
  max-width: 540px;
  line-height: 1.7;
  margin-bottom: 2rem;
  opacity: 0;
}

/* Filters */
.galeri-filters { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.filter-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 50px;
  border: 1.5px solid rgba(237,250,233,0.2);
  background: transparent;
  color: rgba(237,250,233,0.55);
  font-size: 0.8rem; font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  opacity: 0;
  font-family: var(--font-sans);
}
.filter-btn:hover {
  border-color: rgba(212,168,83,0.5);
  color: var(--c-siger);
}
.filter-btn--active {
  border-color: var(--c-siger);
  background: rgba(212,168,83,0.15);
  color: var(--c-siger);
}

/* ─── Bento Grid Section ──────────────────────────────────────── */
.galeri-section {
  padding: 3rem var(--sp-md) 5rem;
}
.galeri-container { max-width: var(--max-w); margin: 0 auto; }

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 240px;
  gap: 0.85rem;
  grid-auto-flow: dense;
}

.bento-item {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  cursor: pointer;
  opacity: 0;
  background: var(--c-cream-dark);
  will-change: transform;
  transition: box-shadow 0.35s ease;
}
.bento-item:hover { box-shadow: 0 12px 36px rgba(15,36,9,0.18); }
.bento-item:focus-visible {
  outline: 2px solid var(--c-siger);
  outline-offset: 2px;
}

.bento-item img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease, filter 0.4s ease;
}
.bento-item:hover img {
  transform: scale(1.07);
  filter: brightness(1.06);
}

.bento-item figcaption {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(7,31,4,0.92) 0%, transparent 65%);
  padding: 1.5rem 1rem 0.85rem;
  display: flex; flex-direction: column; gap: 0.2rem;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.bento-item:hover figcaption { opacity: 1; transform: translateY(0); }

.bento-caption-title {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: var(--c-cream);
  font-weight: 600;
}
.bento-caption-cat {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-siger);
}

/* ─── 8 Bento Patterns ────────────────────────────────────────── */
.bento-featured  { grid-column: span 2; grid-row: span 2; }
.bento-tall      { grid-column: span 1; grid-row: span 2; }
.bento-wide      { grid-column: span 2; grid-row: span 1; }
.bento-square    { grid-column: span 1; grid-row: span 1; }
.bento-panorama  { grid-column: span 3; grid-row: span 1; }

/* ─── Skeleton ────────────────────────────────────────────────── */
.bento-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 240px;
  gap: 0.85rem;
}
.bento-skeleton-item { border-radius: var(--radius-md); }

/* ─── Empty State ─────────────────────────────────────────────── */
.galeri-empty {
  text-align: center;
  padding: 5rem 1rem;
  color: var(--c-stone-muted);
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.galeri-empty p { font-size: 1rem; }

/* ─── Lightbox (native <dialog>) ─────────────────────────────── */
.lightbox {
  position: fixed; inset: 0;
  z-index: 9999;
  width: 100vw; height: 100vh;
  max-width: none; max-height: none;
  padding: 0; margin: 0; border: none;
  background: rgba(7, 24, 4, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: none; align-items: center; justify-content: center;
}
.lightbox[open] { display: flex; }
.lightbox:not([open]) { display: none !important; }
.lightbox::backdrop { background: transparent; }

.lightbox-inner {
  position: relative;
  width: 100%; max-width: 1000px;
  display: flex; flex-direction: column; align-items: center;
  padding: 2rem;
}

.lb-img-wrap {
  width: 100%;
  max-height: 75vh;
  display: flex; align-items: center; justify-content: center;
}
.lb-img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}

.lb-close {
  position: absolute; top: 0; right: 0;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--c-cream);
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}
.lb-close:hover { background: rgba(255,255,255,0.2); }

.lb-prev, .lb-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--c-cream);
  width: 48px; height: 48px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}
.lb-prev { left: 0; }
.lb-next { right: 0; }
.lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,0.2); }

.lb-caption {
  margin-top: 1.25rem;
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; max-width: 700px;
  padding: 0 0.5rem;
}
.lb-title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--c-cream);
}
.lb-counter {
  font-size: 0.75rem;
  color: rgba(237,250,233,0.4);
  letter-spacing: 0.1em;
}

/* ─── Responsive ──────────────────────────────────────────────── */
@media (max-width: 900px) {
  .bento-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: 200px; }
  .bento-featured { grid-column: span 2; grid-row: span 2; }
  .bento-panorama { grid-column: span 2; }
}
@media (max-width: 600px) {
  .galeri-hero { padding: 7rem 1.25rem 3.5rem; }
  .galeri-section { padding: 2rem 1.25rem 3.5rem; }
  .bento-grid { grid-template-columns: 1fr; grid-auto-rows: 220px; }
  .bento-featured, .bento-wide, .bento-tall, .bento-panorama, .bento-square {
    grid-column: span 1; grid-row: span 1;
  }
  .lb-prev { left: -0.5rem; }
  .lb-next { right: -0.5rem; }
}
</style>
