<template>
  <section id="profil" class="profil-section" ref="sectionRef">
    <div class="profil-container">
      <div class="profil-grid">
        <!-- Left: Teks -->
        <div class="profil-text">
          <span class="section-label" ref="labelEl">Profil Desa</span>
          <h2 class="section-title" ref="titleEl">
            Mengenal <span class="text-highlight" ref="highlightEl">Umbul Limus</span>
          </h2>
          <p class="profil-sejarah" ref="textEl" v-if="data.sejarah">{{ data.sejarah }}</p>
          <p class="profil-sejarah" ref="textEl" v-else>
            Desa Umbul Limus adalah destinasi wisata alam yang terletak di Pesawaran, Lampung.
            Dikenal dengan sumber mata air alaminya, hutan tropis yang lebat, dan kearifan budaya Lampung yang lestari.
          </p>
        </div>

        <!-- Right: Stats Grid -->
        <div class="profil-stats" ref="statsEl">
          <div
            v-for="(stat, i) in stats"
            :key="stat.label"
            class="stat-card"
            :ref="el => { if(el) statEls[i] = el }"
          >
            <div class="stat-icon" v-html="stat.icon"></div>
            <div class="stat-value" :ref="el => { if(el) counterEls[i] = el }">{{ stat.display }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative wave -->
    <div class="profil-wave" aria-hidden="true"></div>
  </section>
</template>

<script setup>
import anime from 'animejs'
import { nextTick, onMounted, ref } from 'vue'

const data = ref({})
const sectionRef = ref(null)
const labelEl    = ref(null)
const titleEl    = ref(null)
const highlightEl = ref(null)
const textEl     = ref(null)
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const statsEl    = ref(null)
const statEls    = ref([])
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const counterEls = ref([])

const stats = ref([
  { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', label: 'Jumlah Penduduk', display: '3.200+', numericTarget: 3200 },
  { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>', label: 'Luas Wilayah', display: '12,4 km²', numericTarget: null },
  { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', label: 'Jumlah RT / RW', display: '12 RT / 4 RW', numericTarget: null },
  { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', label: 'Tahun Berdiri', display: '1958', numericTarget: null },
])

let hasEntered = false

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
      translateY: [24, 0],
      duration: 700,
    }, '-=300')
    .add({
      targets: highlightEl.value,
      backgroundSize: ['0% 100%', '100% 100%'],
      duration: 700,
      easing: 'easeOutQuart',
    }, '-=450')
    .add({
      targets: textEl.value,
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
    }, '-=350')
    .add({
      targets: statEls.value.filter(Boolean),
      opacity: [0, 1],
      translateY: [28, 0],
      scale: [0.92, 1],
      delay: anime.stagger(90),
      duration: 700,
      easing: 'easeOutBack',
    }, '-=300')
}

onMounted(async () => {
  try {
    const res = await fetch('/data/profil/data.json')
    if (res.ok) {
      data.value = await res.json()
      // Update stats dari data JSON
      if (data.value.jumlah_penduduk) stats.value[0].display = data.value.jumlah_penduduk
      if (data.value.luas_wilayah)    stats.value[1].display = data.value.luas_wilayah
      if (data.value.jumlah_rt && data.value.jumlah_rw)
        stats.value[2].display = `${data.value.jumlah_rt} RT / ${data.value.jumlah_rw} RW`
      if (data.value.tahun_berdiri)   stats.value[3].display = data.value.tahun_berdiri
    }
  } catch (e) {
    console.error('Gagal memuat profil desa:', e)
  }

  await nextTick()

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animateIn()
    })
  }, { threshold: 0.1 })

  if (sectionRef.value) observer.observe(sectionRef.value)

  // Immediate check jika section sudah di viewport
  if (sectionRef.value) {
    const rect = sectionRef.value.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) animateIn()
  }
})
</script>

<style scoped>
.profil-section {
  position: relative;
  background: var(--c-stone);
  padding: calc(var(--sp-xl) + 20px) var(--sp-md) var(--sp-xl);
  overflow: hidden;
  z-index: 2;
}

.profil-container { max-width: var(--max-w); margin: 0 auto; }

.profil-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

/* Text */
.section-label { color: var(--c-sage-light); }
.section-title { color: var(--c-cream); }

.text-highlight {
  background: linear-gradient(120deg, rgba(212, 168, 83, 0.5) 0%, rgba(212, 168, 83, 0.5) 100%);
  background-repeat: no-repeat;
  background-size: 0% 100%;
  padding: 0 0.1em;
  border-radius: 3px;
  display: inline-block;
}

.profil-sejarah {
  font-size: 1rem;
  color: rgba(237, 250, 233, 0.65);
  line-height: 1.8;
  margin-top: 1.5rem;
}

/* Stats */
.profil-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 1.5rem 1.25rem;
  text-align: center;
  transition: border-color 0.3s ease, background 0.3s ease;
  backdrop-filter: blur(4px);
}
.stat-card:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(212, 168, 83, 0.25);
}

.stat-icon {
  width: 32px; height: 32px;
  margin: 0 auto 0.75rem;
  color: var(--c-siger);
}
.stat-icon :deep(svg) { width: 100%; height: 100%; }

.stat-value {
  font-family: var(--font-serif);
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--c-cream);
  line-height: 1.1;
  margin-bottom: 0.35rem;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(237, 250, 233, 0.45);
}

/* Decorative wave bottom */
.profil-wave {
  position: absolute; bottom: -1px; left: 0; width: 100%; height: 70px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 70'%3E%3Cpath fill='%23edf8e9' d='M0,35 C360,-10 1080,80 1440,35 L1440,70 L0,70 Z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
  z-index: 2;
}

@media (max-width: 900px) {
  .profil-grid { grid-template-columns: 1fr; gap: 2.5rem; }
}
@media (max-width: 600px) {
  .profil-section { padding: var(--sp-lg) 1.25rem var(--sp-xl); }
  .profil-stats { grid-template-columns: 1fr 1fr; }
  .stat-value { font-size: 1.3rem; }
}
</style>
