<template>
  <section id="visi-misi" class="visimisi-section" ref="sectionRef">
    <div class="visimisi-container">
      <!-- Section Header -->
      <header class="visimisi-header">
        <span class="section-label" ref="labelEl">Arah Pembangunan</span>
        <h2 class="section-title" ref="titleEl">
          Visi &amp; <span class="text-highlight" ref="highlightEl">Misi Desa</span>
        </h2>
        <p class="visimisi-desc" ref="descEl">
          Pedoman dan komitmen Desa Umbul Limus dalam mewujudkan kesejahteraan dan kemajuan bersama.
        </p>
      </header>

      <!-- Main Content -->
      <div class="visimisi-content">
        <!-- Visi Card -->
        <article class="visi-card" ref="visiCardEl">
          <div class="visi-badge">VISI DESA</div>
          <blockquote class="visi-quote">
            “{{ visiMisiData.visi }}”
          </blockquote>
        </article>

        <!-- Misi Header & Grid -->
        <div class="misi-container">
          <h3 class="misi-heading" ref="misiHeadingEl">Misi Pembangunan</h3>
          <div class="misi-grid">
            <article
              v-for="(item, index) in visiMisiData.misi"
              :key="index"
              class="misi-card"
              :ref="el => { if(el) misiEls[index] = el }"
            >
              <div class="misi-number">{{ formatNumber(index + 1) }}</div>
              <p class="misi-text">{{ getMisiText(item) }}</p>
            </article>
          </div>

          <RouterLink to="/bagan" class="visimisi-cta" ref="ctaEl">
            Cari Tahu Struktur Desa Lengkap
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
            </svg>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import anime from 'animejs'
import { nextTick, onMounted, ref } from 'vue'

const DEFAULT_DATA = {
  visi: 'Terwujudnya Desa Umbul Limus yang maju, mandiri, sejahtera, religius, dan berbudaya melalui pembangunan yang berkelanjutan serta pemberdayaan masyarakat.',
  misi: [
    'Meningkatkan kualitas pelayanan pemerintahan desa yang transparan dan akuntabel.',
    'Mengembangkan potensi pertanian dan sumber daya alam secara berkelanjutan.',
    'Meningkatkan kualitas pendidikan, literasi, dan sumber daya manusia.',
    'Mendorong pertumbuhan ekonomi melalui UMKM dan BUMDes.',
    'Meningkatkan pembangunan infrastruktur desa yang merata.',
    'Menjaga keamanan, ketertiban, serta kelestarian lingkungan.',
    'Melestarikan budaya dan memperkuat nilai-nilai keagamaan serta gotong royong.'
  ]
}

const visiMisiData = ref({ ...DEFAULT_DATA })
const loading = ref(true)

const sectionRef = ref(null)
const labelEl = ref(null)
const titleEl = ref(null)
const highlightEl = ref(null)
const descEl = ref(null)
const visiCardEl = ref(null)
const misiHeadingEl = ref(null)
const misiEls = ref([])
const ctaEl = ref(null)

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const formatNumber = (num) => String(num).padStart(2, '0')

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const getMisiText = (item) => {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') {
    return item.misi_item || item.misi || item.text || item.title || String(item)
  }
  return String(item || '')
}

let hasEntered = false

const animateIn = () => {
  if (hasEntered) return
  hasEntered = true

  const targets = [
    labelEl.value,
    titleEl.value,
    descEl.value,
    visiCardEl.value,
    misiHeadingEl.value,
    ...misiEls.value.filter(Boolean),
    ctaEl.value,
  ].filter(Boolean)

  if (!targets.length) return
  anime.remove(targets)

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
      targets: descEl.value,
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 600,
    }, '-=400')
    .add({
      targets: visiCardEl.value,
      opacity: [0, 1],
      translateY: [25, 0],
      duration: 750,
    }, '-=300')
    .add({
      targets: misiHeadingEl.value,
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 500,
    }, '-=400')
    .add({
      targets: misiEls.value.filter(Boolean),
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(70),
      duration: 650,
      easing: 'easeOutExpo',
    }, '-=300')
}

onMounted(async () => {
  try {
    const res = await fetch('/data/visi-misi/data.json')
    if (res.ok) {
      const json = await res.json()
      if (json && typeof json === 'object') {
        const fetchedVisi = typeof json.visi === 'string' && json.visi.trim() ? json.visi.trim() : DEFAULT_DATA.visi
        let fetchedMisi = DEFAULT_DATA.misi
        if (Array.isArray(json.misi) && json.misi.length > 0) {
          fetchedMisi = json.misi
        }
        visiMisiData.value = {
          visi: fetchedVisi,
          misi: fetchedMisi
        }
      }
    }
  } catch (e) {
    console.error('Gagal memuat data Visi & Misi:', e)
  } finally {
    loading.value = false
  }

  await nextTick()

  // If section is already in viewport after load, trigger animateIn
  if (sectionRef.value) {
    const rect = sectionRef.value.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      animateIn()
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateIn()
        }
      })
    },
    { threshold: 0.1 }
  )

  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style scoped>
.visimisi-section {
  position: relative;
  background: var(--c-cream);
  padding: var(--sp-xl) var(--sp-md);
  z-index: 1;
}

.visimisi-container {
  max-width: var(--max-w);
  margin: 0 auto;
}

.visimisi-header {
  max-width: 620px;
  margin-bottom: 3rem;
}

.text-highlight {
  background: linear-gradient(120deg, rgba(212, 168, 83, 0.38) 0%, rgba(212, 168, 83, 0.38) 100%);
  background-repeat: no-repeat;
  background-size: 0% 100%;
  padding: 0 0.1em;
  border-radius: 3px;
  display: inline-block;
}

.visimisi-desc {
  color: var(--c-stone-muted);
  margin-top: 0.75rem;
  font-size: 1rem;
}

/* Skeleton */
.visimisi-skeleton { display: flex; flex-direction: column; gap: 1.5rem; }
.skeleton-visi { height: 160px; border-radius: var(--radius-md); }
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
.skeleton-misi { height: 90px; border-radius: var(--radius-md); }

/* Visi Card */
.visi-card {
  position: relative;
  background: linear-gradient(135deg, var(--c-stone) 0%, #173611 100%);
  color: var(--c-white);
  padding: 2.5rem 2rem;
  border-radius: var(--radius-md);
  box-shadow: 0 12px 32px rgba(15, 36, 9, 0.15);
  margin-bottom: 3.5rem;
  border-left: 4px solid var(--c-siger);
  overflow: hidden;
}

.visi-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--c-siger);
  background: rgba(212, 168, 83, 0.12);
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  border: 1px solid rgba(212, 168, 83, 0.3);
  margin-bottom: 1.25rem;
}

.visi-quote {
  font-family: var(--font-serif);
  font-size: clamp(1.25rem, 2.8vw, 1.85rem);
  font-weight: 500;
  line-height: 1.5;
  color: var(--c-cream);
  margin: 0;
  font-style: italic;
}

/* Misi Section */
.misi-container { margin-top: 2rem; }

.misi-heading {
  font-family: var(--font-serif);
  font-size: 1.65rem;
  color: var(--c-stone);
  margin-bottom: 1.5rem;
}

.misi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.misi-card {
  background: var(--c-white);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  border: 1px solid var(--c-cream-dark);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.misi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(15, 36, 9, 0.12);
}

.misi-number {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--c-siger);
  background: var(--c-cream);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(212, 168, 83, 0.3);
}

.misi-text {
  font-size: 0.95rem;
  color: var(--c-stone);
  line-height: 1.6;
  margin: 0;
  padding-top: 0.2rem;
}

.visimisi-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-terra);
  border: 1.5px solid var(--c-terra);
  padding: 0.65rem 1.35rem;
  border-radius: 50px;
  margin-top: 2rem;
  transition: var(--transition);
  text-decoration: none;
  opacity: 0;
}
.visimisi-cta:hover {
  background: var(--c-terra);
  color: var(--c-white);
  transform: translateX(3px);
}

@media (max-width: 600px) {
  .visimisi-section { padding: var(--sp-lg) 1.25rem; }
  .visi-card { padding: 1.75rem 1.25rem; }
  .misi-grid { grid-template-columns: 1fr; }
}
</style>
