<template>
  <section id="galeri-preview" class="preview-galeri wave-bottom-dark" ref="sectionRef">
    <div class="pg-container">
      <header class="pg-header">
        <span class="section-label on-dark" ref="labelEl">Galeri Foto</span>
        <div class="pg-header-row">
          <h2 class="section-title on-dark" ref="titleEl">
            Keindahan <span class="text-highlight-dark" ref="highlightEl">Umbul Limus</span>
          </h2>
          <RouterLink to="/galeri" class="cta-link-dark" ref="ctaEl">
            Buka Galeri Lengkap
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
            </svg>
          </RouterLink>
        </div>
      </header>

      <div class="pg-bento-skeleton" v-if="loading" aria-hidden="true">
        <div v-for="(cls, n) in ['pg-wide','pg-tall','pg-sq','pg-sq','pg-wide','pg-tall']" :key="n"
          class="skeleton-box" :class="cls"></div>
      </div>

      <div class="pg-bento" v-else ref="bentoEl">
        <figure
          v-for="(img, i) in images"
          :key="i"
          class="pg-item"
          :class="bentoClass(i)"
          :ref="el => { if(el) itemEls[i] = el }"
          @click="openLightbox(i)"
          @mouseenter="onEnter"
          @mouseleave="onLeave"
          :aria-label="`Lihat foto: ${img.alt}`"
        >
          <img :src="img.src" :alt="img.alt" loading="lazy" decoding="async" />
          <figcaption>{{ img.alt }}</figcaption>
        </figure>
      </div>

      <div class="pg-cta-mobile">
        <RouterLink to="/galeri" class="cta-link-dark" style="opacity:1">
          Buka Galeri Lengkap
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
          </svg>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import anime from 'animejs'
import { nextTick, onMounted, ref } from 'vue'
import { useCardHover } from '../composables/useCardHover.js'
import { useScrollExit } from '../composables/useScrollExit.js'

const { onEnter, onLeave } = useCardHover({ lift: -6, scale: 1.015 })
const images  = ref([])
const loading = ref(true)
const sectionRef = ref(null)
const labelEl    = ref(null)
const titleEl    = ref(null)
const highlightEl = ref(null)
const ctaEl      = ref(null)
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const bentoEl    = ref(null)
const itemEls    = ref([])
let hasEntered   = false

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const bentoClass = i => {
  const p = ['pg-wide', 'pg-tall', 'pg-sq', 'pg-sq', 'pg-wide', 'pg-sq']
  return p[i % p.length]
}

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const openLightbox = (_i) => {
  // Delegate ke GaleriPage; dari preview cukup navigate
  // Bisa dikembangkan dengan emit jika dibutuhkan
}

const animateIn = async () => {
  if (hasEntered) return
  hasEntered = true
  await nextTick()

  anime.timeline({ easing: 'easeOutExpo' })
    .add({
      targets: labelEl.value,
      clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeInOutQuart',
    })
    .add({
      targets: [titleEl.value, ctaEl.value].filter(Boolean),
      opacity: [0, 1],
      translateY: [18, 0],
      delay: anime.stagger(80),
      duration: 700,
    }, '-=300')
    .add({
      targets: highlightEl.value,
      backgroundSize: ['0% 100%', '100% 100%'],
      duration: 700,
      easing: 'easeOutQuart',
    }, '-=450')
    .add({
      targets: itemEls.value.filter(Boolean),
      opacity: [0, 1],
      scale: [0.88, 1.02, 1],
      rotateZ: (_, i) => [i % 2 === 0 ? -1.5 : 1.5, 0],
      delay: anime.stagger(70, { grid: [3, 2], from: 'center' }),
      duration: 800,
      easing: 'easeOutBack',
    }, '-=200')
}

// Exit: bento items terangkat ke atas & menyusut saat section dilewati
useScrollExit(
  sectionRef,
  () => itemEls.value.filter(Boolean).map((el, i) => ({
    el, x: (i % 2 === 0 ? -1 : 1) * (20 + (i % 3) * 10), y: -90 - (i % 3) * 12, scale: 0.92,
  })),
  { exitZone: 280, staggerPx: 10 },
)

onMounted(async () => {
  try {
    const res = await fetch('/images/galeri/manifest.json', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      images.value = (data.images || []).slice(0, 6)
    }
  } catch {
    // Fallback ke gallery/list.json
    try {
      const res2 = await fetch('/data/gallery/list.json', { cache: 'no-store' })
      if (res2.ok) {
        const data = await res2.json()
        images.value = data.slice(0, 6).map(d => ({ src: d.gambar, alt: d.judul, kategori: '' }))
      }
    } catch {
      console.error('Gagal memuat gambar galeri')
    }
  } finally {
    loading.value = false
  }

  await nextTick()

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateIn() })
  }, { threshold: 0.12 })
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style scoped>
.preview-galeri {
  position: relative;
  background: var(--c-gallery-bg);
  padding: calc(var(--sp-xl) + 20px) var(--sp-md) calc(var(--sp-xl) + 50px);
  overflow: visible;
  z-index: 2;
}

.pg-container { max-width: var(--max-w); margin: 0 auto; position: relative; z-index: 1; }

.pg-header { margin-bottom: 2rem; }

.pg-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.text-highlight-dark {
  background: linear-gradient(120deg, rgba(212, 168, 83, 0.45) 0%, rgba(212, 168, 83, 0.45) 100%);
  background-repeat: no-repeat;
  background-size: 0% 100%;
  padding: 0 0.1em;
  border-radius: 3px;
  display: inline-block;
}

.cta-link-dark {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--c-siger);
  border: 1.5px solid rgba(212, 168, 83, 0.4);
  padding: 0.65rem 1.35rem;
  border-radius: 50px;
  transition: var(--transition);
  white-space: nowrap;
  opacity: 0;
  text-decoration: none;
}
.cta-link-dark:hover {
  border-color: var(--c-siger);
  background: var(--c-siger-glow);
  transform: translateX(3px);
}

/* Bento Grid */
.pg-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 200px;
  gap: 0.75rem;
}

.pg-bento-skeleton {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 200px;
  gap: 0.75rem;
  pointer-events: none;
  opacity: 0.4;
}

.pg-item {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  cursor: pointer;
  will-change: transform;
}
.pg-item img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease, filter 0.4s ease;
}
.pg-item:hover img {
  transform: scale(1.07);
  filter: brightness(1.08);
}
.pg-item figcaption {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(7, 31, 4, 0.88) 0%, transparent 60%);
  color: var(--c-cream);
  font-size: 0.78rem;
  padding: 1rem 0.9rem 0.7rem;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.pg-item:hover figcaption { opacity: 1; transform: translateY(0); }

.pg-wide  { grid-column: span 2; }
.pg-tall  { grid-row: span 2; }
.pg-sq    { grid-column: span 1; grid-row: span 1; }

.pg-cta-mobile { display: none; text-align: center; margin-top: 1.75rem; }

@media (max-width: 768px) {
  .pg-bento { grid-template-columns: 1fr 1fr; grid-auto-rows: 160px; }
  .pg-wide { grid-column: span 2; }
  .pg-tall { grid-row: span 1; }
}
@media (max-width: 600px) {
  .preview-galeri { padding: var(--sp-lg) 1.25rem calc(var(--sp-lg) + 50px); }
  .pg-bento { grid-template-columns: 1fr; }
  .pg-wide, .pg-tall { grid-column: span 1; grid-row: span 1; }
  .cta-link-dark { display: none; }
  .pg-cta-mobile { display: block; }
}
</style>
