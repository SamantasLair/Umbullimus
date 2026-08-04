<template>
  <section id="wisata" class="preview-wisata" ref="sectionRef">
    <div class="pw-container">
      <header class="pw-header" ref="headerEl">
        <div class="pw-header-text">
          <span class="section-label" ref="labelEl">Destinasi Wisata</span>
          <h2 class="section-title" ref="titleEl">
            Tempat <span class="text-highlight" ref="highlightEl">Wisata</span>
          </h2>
          <p class="pw-desc" ref="descEl">
            Jelajahi keindahan alam dan kekayaan budaya yang menanti di Umbul Limus. Klik kartu untuk melihat rincian selengkapnya.
          </p>
        </div>
      </header>

      <div class="pw-skeleton" v-if="loading" aria-hidden="true">
        <div v-for="n in 3" :key="n" class="skeleton-box" style="height:340px;border-radius:10px"></div>
      </div>

      <div class="pw-grid" v-else>
        <article
          v-for="(place, i) in places"
          :key="place.id"
          class="pw-card"
          :ref="el => { if(el) cardEls[i] = el }"
          @click="openModal(place)"
          @mouseenter="onEnter"
          @mouseleave="onLeave"
          tabindex="0"
          role="button"
          :aria-label="`Lihat rincian tempat wisata ${place.nama}`"
          @keydown.enter="openModal(place)"
        >
          <div class="pw-card-img">
            <img :src="place.gambar" :alt="place.nama" loading="lazy" decoding="async" />
            <span class="pw-kategori">{{ place.kategori }}</span>
          </div>
          <div class="pw-card-body">
            <h3 class="pw-nama">{{ place.nama }}</h3>
            <p class="pw-desc-card">{{ place.deskripsi }}</p>
            
            <div class="pw-tags-row" v-if="place.fasilitas?.length">
              <span v-for="f in place.fasilitas" :key="f" class="pw-tag">{{ f }}</span>
            </div>

            <div class="pw-read-more">
              <span>Baca Selengkapnya</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </article>
      </div>

      <!-- Modal Detail Destinasi Wisata -->
      <Teleport to="body">
        <Transition name="modal-pop">
          <div
            v-if="selectedPlace"
            class="pw-modal-backdrop"
            @click.self="closeModal"
            @keydown.esc="closeModal"
            tabindex="0"
            ref="modalBackdrop"
          >
            <div class="pw-modal-card" role="dialog" aria-modal="true" :aria-label="selectedPlace.nama">
              <button type="button" class="pw-modal-close" @click="closeModal" aria-label="Tutup jendela rincian">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>

              <div class="pw-modal-hero">
                <img :src="selectedPlace.gambar" :alt="selectedPlace.nama" />
                <span class="pw-kategori pw-modal-badge">{{ selectedPlace.kategori }}</span>
              </div>

              <div class="pw-modal-content">
                <h3 class="pw-modal-title">{{ selectedPlace.nama }}</h3>
                <p class="pw-modal-text">{{ selectedPlace.deskripsi }}</p>

                <div v-if="selectedPlace.fasilitas?.length" class="pw-modal-section">
                  <h4 class="pw-modal-sub">Daya Tarik & Fasilitas Usulan</h4>
                  <div class="pw-modal-facilities">
                    <span v-for="item in selectedPlace.fasilitas" :key="item" class="pw-modal-chip">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {{ item }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </section>
</template>

<script setup>
import anime from 'animejs'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useCardHover } from '../composables/useCardHover.js'
import { useScrollExit } from '../composables/useScrollExit.js'

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const { onEnter, onLeave } = useCardHover()
const places  = ref([])
const loading = ref(true)
const sectionRef = ref(null)
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const headerEl   = ref(null)
const labelEl    = ref(null)
const titleEl    = ref(null)
const highlightEl = ref(null)
const descEl     = ref(null)
const cardEls    = ref([])
let hasEntered   = false

// Modal state
const selectedPlace = ref(null)
const modalBackdrop = ref(null)

const openModal = (place) => {
  selectedPlace.value = place
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    modalBackdrop.value?.focus()
  })
}

const closeModal = () => {
  selectedPlace.value = null
  document.body.style.overflow = ''
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && selectedPlace.value) {
    closeModal()
  }
}

const animateIn = async () => {
  if (hasEntered) return
  await nextTick()
  const validCards = cardEls.value.filter(Boolean)
  if (!validCards.length) return
  hasEntered = true

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
    }, '-=350')
    .add({
      targets: validCards,
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.94, 1],
      delay: anime.stagger(100),
      duration: 750,
      easing: 'easeOutBack',
    }, '-=300')
}

// Exit: kartu wisata melebar & naik saat section dilewati ke atas
useScrollExit(
  sectionRef,
  () => cardEls.value.filter(Boolean).map((el, i) => ({
    el, x: (i - 1) * 40, y: -90 - i * 10, rotate: (i - 1) * 3, scale: 0.93,
  })),
  { exitZone: 280, staggerPx: 14 },
)

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  try {
    const res = await fetch('/data/tempat-wisata/list.json', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      places.value = json.items || []
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

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.preview-wisata {
  position: relative;
  background: var(--c-cream-dark);
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
  transition: box-shadow 0.35s ease, transform 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.pw-card:hover {
  box-shadow: var(--shadow-lift);
}

.pw-card-img {
  position: relative;
  height: 210px;
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
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.pw-card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.pw-nama {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  color: var(--c-stone);
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.pw-desc-card {
  font-size: 0.85rem;
  color: var(--c-stone-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.pw-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: auto;
  margin-bottom: 0.85rem;
}

.pw-tag {
  font-size: 0.72rem;
  background: rgba(122, 74, 58, 0.07);
  color: var(--c-terracotta);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.pw-read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--c-terracotta);
  transition: gap 0.25s ease, color 0.25s ease;
  margin-top: 0.25rem;
}

.pw-card:hover .pw-read-more {
  gap: 0.65rem;
  color: #5c3527;
}

/* Teleport Modal Styles */
.pw-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(24, 20, 18, 0.75);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  outline: none;
}

.pw-modal-card {
  background: var(--c-white);
  border-radius: var(--radius-lg);
  max-width: 580px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  position: relative;
  border: 1px solid rgba(212, 168, 83, 0.2);
}

.pw-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease, transform 0.2s ease;
}
.pw-modal-close:hover {
  background: var(--c-terracotta);
  transform: scale(1.08);
}

.pw-modal-hero {
  position: relative;
  height: 260px;
}
.pw-modal-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pw-modal-badge {
  top: 1rem;
  left: 1rem;
}

.pw-modal-content {
  padding: 1.75rem;
}

.pw-modal-title {
  font-family: var(--font-serif);
  font-size: 1.6rem;
  color: var(--c-stone);
  margin-bottom: 0.75rem;
  line-height: 1.25;
}

.pw-modal-text {
  font-size: 0.95rem;
  color: var(--c-stone-muted);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.pw-modal-section {
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
  padding-top: 1.25rem;
}

.pw-modal-sub {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-terracotta);
  margin-bottom: 0.75rem;
}

.pw-modal-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pw-modal-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(122, 74, 58, 0.08);
  color: var(--c-stone);
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  border: 1px solid rgba(122, 74, 58, 0.15);
}

/* Modal Transition */
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-pop-enter-active .pw-modal-card,
.modal-pop-leave-active .pw-modal-card {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
}

.modal-pop-enter-from .pw-modal-card,
.modal-pop-leave-to .pw-modal-card {
  opacity: 0;
  transform: scale(0.92) translateY(16px);
}

@media (max-width: 900px) {
  .pw-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .preview-wisata { padding: var(--sp-lg) 1.25rem; }
  .pw-grid { grid-template-columns: 1fr; }
  .pw-modal-hero { height: 200px; }
  .pw-modal-content { padding: 1.25rem; }
  .pw-modal-title { font-size: 1.35rem; }
}
</style>
