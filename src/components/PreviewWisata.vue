<template>
  <section id="wisata-preview" class="preview-wisata" ref="sectionRef">
    <div class="pw-container">
      <header class="pw-header" ref="headerEl">
        <div class="pw-header-text">
          <span class="section-label" ref="labelEl">Destinasi Wisata</span>
          <h2 class="section-title" ref="titleEl">
            Tempat <span class="text-highlight" ref="highlightEl">Wisata</span>
          </h2>
          <p class="pw-desc" ref="descEl">
            Jelajahi keindahan alam dan kekayaan budaya yang menanti di Umbul Limus.
          </p>
        </div>
        <RouterLink to="/wisata" class="cta-link desktop-cta" ref="ctaEl">
          Lihat Semua Wisata
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
          </svg>
        </RouterLink>
      </header>

      <div class="pw-skeleton" v-if="loading" aria-hidden="true">
        <div v-for="n in 3" :key="n" class="skeleton-box" style="height:320px;border-radius:10px"></div>
      </div>

      <div class="pw-grid" v-else>
        <article
          v-for="(place, i) in places"
          :key="place.id"
          class="pw-card"
          :ref="el => { if(el) cardEls[i] = el }"
        >
          <div class="pw-card-img">
            <img :src="place.gambar" :alt="place.nama" loading="lazy" decoding="async" />
            <span class="pw-kategori">{{ place.kategori }}</span>
          </div>
          <div class="pw-card-body">
            <h3 class="pw-nama">{{ place.nama }}</h3>
            <p class="pw-desc-card">{{ place.deskripsi }}</p>
          </div>
        </article>
      </div>

      <div class="pw-cta-mobile">
        <RouterLink to="/wisata" class="cta-link">
          Lihat Semua Wisata
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

const places  = ref([])
const loading = ref(true)
const sectionRef = ref(null)
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const headerEl   = ref(null)
const labelEl    = ref(null)
const titleEl    = ref(null)
const highlightEl = ref(null)
const descEl     = ref(null)
const ctaEl      = ref(null)
const cardEls    = ref([])
let hasEntered   = false

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
      targets: titleEl.value,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
    }, '-=300')
    .add({
      targets: highlightEl.value,
      backgroundSize: ['0% 100%', '100% 100%'],
      duration: 700,
      easing: 'easeOutQuart',
    }, '-=450')
    .add({
      targets: [descEl.value, ctaEl.value].filter(Boolean),
      opacity: [0, 1],
      translateY: [12, 0],
      delay: anime.stagger(80),
      duration: 600,
    }, '-=350')
    .add({
      targets: cardEls.value.filter(Boolean),
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.94, 1],
      delay: anime.stagger(100),
      duration: 750,
      easing: 'easeOutBack',
    }, '-=300')
}

onMounted(async () => {
  try {
    const res = await fetch('/data/tempat-wisata/list.json')
    if (res.ok) {
      const all = await res.json()
      places.value = all.slice(0, 3)
    }
  } catch (e) {
    console.error('Gagal memuat wisata:', e)
  } finally {
    loading.value = false
  }

  await nextTick()

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateIn() })
  }, { threshold: 0.1 })
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style scoped>
.preview-wisata {
  position: relative;
  background: var(--c-cream);
  padding: var(--sp-xl) var(--sp-md);
  z-index: 1;
}

.pw-container { max-width: var(--max-w); margin: 0 auto; }

.pw-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.pw-header-text { flex: 1; }

.text-highlight {
  background: linear-gradient(120deg, rgba(212, 168, 83, 0.38) 0%, rgba(212, 168, 83, 0.38) 100%);
  background-repeat: no-repeat;
  background-size: 0% 100%;
  padding: 0 0.1em;
  border-radius: 3px;
  display: inline-block;
}

.pw-desc {
  font-size: 1rem;
  color: var(--c-stone-muted);
  margin-top: 0.75rem;
}

.cta-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--c-terra);
  border: 1.5px solid var(--c-terra);
  padding: 0.65rem 1.35rem;
  border-radius: 50px;
  transition: var(--transition);
  white-space: nowrap;
  text-decoration: none;
}
.cta-link:hover {
  background: var(--c-terra);
  color: var(--c-white);
  transform: translateX(3px);
}

.pw-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.pw-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--c-white);
  box-shadow: var(--shadow-card);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}
.pw-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lift);
}

.pw-card-img {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.pw-card-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.pw-card:hover .pw-card-img img { transform: scale(1.06); }

.pw-kategori {
  position: absolute;
  top: 0.75rem; left: 0.75rem;
  background: var(--c-siger);
  color: var(--c-stone);
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  padding: 0.25rem 0.65rem;
  border-radius: 50px;
}

.pw-card-body { padding: 1.25rem; }

.pw-nama {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: var(--c-stone);
  margin-bottom: 0.5rem;
}

.pw-desc-card {
  font-size: 0.85rem;
  color: var(--c-stone-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pw-cta-mobile { display: none; text-align: center; margin-top: 2rem; }
.pw-cta-mobile .cta-link { opacity: 1; }

.desktop-cta { display: inline-flex; }

@media (max-width: 900px) {
  .pw-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .preview-wisata { padding: var(--sp-lg) 1.25rem; }
  .pw-grid { grid-template-columns: 1fr; }
  .desktop-cta { display: none; }
  .pw-cta-mobile { display: block; }
}
</style>
