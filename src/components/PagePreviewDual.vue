<template>
  <section id="page-preview" class="page-preview-dual" ref="sectionRef">
    <div class="ppd-container">
      <header class="ppd-header">
        <span class="section-label" ref="labelEl">Selengkapnya</span>
        <h2 class="section-title" ref="titleEl">
          Lebih Dalam <span class="text-highlight" ref="highlightEl">Mengenal Desa</span>
        </h2>
      </header>

      <div class="ppd-grid">
        <!-- Kartu Bagan / Struktur Desa -->
        <RouterLink to="/bagan" class="ppd-card ppd-card--bagan" :ref="el => { if(el) cardEls[0] = el }">
          <div class="ppd-card-bg"></div>
          <div class="ppd-card-content">
            <div class="ppd-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="ppd-tag">Pemerintahan</div>
            <h3 class="ppd-title">Struktur Organisasi Desa</h3>
            <p class="ppd-desc">
              Kenali para pemimpin dan perangkat desa Umbul Limus — dari kepala desa hingga ketua RT yang mengabdi untuk masyarakat.
            </p>
            <span class="ppd-cta">
              Lihat Struktur Lengkap
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
              </svg>
            </span>
          </div>
        </RouterLink>

        <!-- Kartu Infografis -->
        <RouterLink to="/infografis" class="ppd-card ppd-card--infografis" :ref="el => { if(el) cardEls[1] = el }">
          <div class="ppd-card-bg"></div>
          <div class="ppd-card-content">
            <div class="ppd-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
                <line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
            </div>
            <div class="ppd-tag">Data & Statistik</div>
            <h3 class="ppd-title">Infografis Data Desa</h3>
            <p class="ppd-desc">
              Data demografis, mata pencaharian, dan potensi desa Umbul Limus disajikan dalam visual yang mudah dipahami.
            </p>
            <span class="ppd-cta">
              Lihat Infografis Lengkap
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
              </svg>
            </span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import anime from 'animejs'
import { nextTick, onMounted, ref } from 'vue'

const sectionRef = ref(null)
const labelEl    = ref(null)
const titleEl    = ref(null)
const highlightEl = ref(null)
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
      targets: cardEls.value.filter(Boolean),
      opacity: [0, 1],
      translateY: [35, 0],
      scale: [0.94, 1],
      delay: anime.stagger(140),
      duration: 800,
      easing: 'easeOutBack',
    }, '-=300')
}

onMounted(async () => {
  await nextTick()

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateIn() })
  }, { threshold: 0.1 })
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style scoped>
.page-preview-dual {
  position: relative;
  background: var(--c-cream);
  padding: var(--sp-xl) var(--sp-md) calc(var(--sp-xl) + 2rem);
  z-index: 1;
}

.ppd-container { max-width: var(--max-w); margin: 0 auto; }

.ppd-header { margin-bottom: 3rem; }

.text-highlight {
  background: linear-gradient(120deg, rgba(212, 168, 83, 0.38) 0%, rgba(212, 168, 83, 0.38) 100%);
  background-repeat: no-repeat;
  background-size: 0% 100%;
  padding: 0 0.1em;
  border-radius: 3px;
  display: inline-block;
}

.ppd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.ppd-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  padding: 2.5rem 2rem;
  display: block;
  text-decoration: none;
  color: inherit;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  min-height: 340px;
}
.ppd-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 48px rgba(15, 36, 9, 0.2);
}

.ppd-card--bagan {
  background: linear-gradient(135deg, var(--c-stone) 0%, #1a4a10 100%);
  box-shadow: 0 8px 28px rgba(15, 36, 9, 0.12);
}
.ppd-card--infografis {
  background: linear-gradient(135deg, #0a1f07 0%, #1d5812 100%);
  box-shadow: 0 8px 28px rgba(15, 36, 9, 0.12);
}

.ppd-card-bg {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(212,168,83,0.12) 0%, transparent 60%);
  pointer-events: none;
}

.ppd-card-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column;
  height: 100%;
}

.ppd-icon {
  width: 48px; height: 48px;
  color: var(--c-siger);
  margin-bottom: 1.25rem;
  background: rgba(212, 168, 83, 0.1);
  border: 1px solid rgba(212, 168, 83, 0.2);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  padding: 10px;
}
.ppd-icon :deep(svg) { width: 100%; height: 100%; }

.ppd-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-siger);
  margin-bottom: 0.75rem;
}

.ppd-title {
  font-family: var(--font-serif);
  font-size: clamp(1.3rem, 2.5vw, 1.65rem);
  color: var(--c-cream);
  margin-bottom: 1rem;
  line-height: 1.25;
}

.ppd-desc {
  font-size: 0.92rem;
  color: rgba(237, 250, 233, 0.62);
  line-height: 1.7;
  flex: 1;
}

.ppd-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-siger);
  margin-top: 1.75rem;
  transition: gap 0.25s ease;
}
.ppd-card:hover .ppd-cta { gap: 0.7rem; }

@media (max-width: 768px) {
  .ppd-grid { grid-template-columns: 1fr; }
  .ppd-card { min-height: 280px; }
}
@media (max-width: 600px) {
  .page-preview-dual { padding: var(--sp-lg) 1.25rem var(--sp-xl); }
}
</style>
