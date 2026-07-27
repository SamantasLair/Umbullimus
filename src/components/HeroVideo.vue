<template>
  <section id="home" class="hero" ref="heroSection">
    <div class="hero-overlay"></div>

    <video autoplay loop muted playsinline class="hero-video" aria-hidden="true" ref="videoEl">
      <source src="https://cdn.pixabay.com/video/2019/11/17/29168-373809623_large.mp4" type="video/mp4" />
    </video>

    <!-- Siger decor -->
    <div class="hero-siger-bg" aria-hidden="true">
      <SigerDecor :size="320" color="rgba(212,168,83,0.32)" trigger="load" :delay="2000" />
    </div>

    <!-- Grain texture overlay -->
    <div class="hero-grain" aria-hidden="true"></div>

    <div class="hero-content" ref="contentEl">
      <!-- Badge -->
      <div class="hero-badge-wrap" ref="badgeEl">
        <span class="badge-dot"></span>
        <span class="hero-badge">Pesawaran · Lampung</span>
      </div>

      <!-- Title split -->
      <h1 class="hero-title" aria-label="Umbul Limus">
        <span class="title-line title-line--1" ref="line1El">
          <span class="title-word">Umbul</span>
        </span>
        <span class="title-line title-line--2" ref="line2El">
          <em class="title-word">Limus</em>
        </span>
      </h1>

      <!-- Tagline -->
      <p class="hero-tagline" ref="taglineEl">
        Surga tersembunyi, mata air jernih,<br>hutan tropis, dan warisan budaya Lampung.
      </p>

      <!-- CTA Actions -->
      <div class="hero-actions" ref="actionsEl">
        <RouterLink to="/#wisata" class="btn-primary" @click.prevent="scrollTo('wisata')">
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
          </svg>
          Jelajahi Wisata
        </RouterLink>
        <RouterLink to="/galeri" class="btn-ghost">
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 11.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd"/>
          </svg>
          Lihat Galeri
        </RouterLink>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="hero-scroll" ref="scrollEl" aria-hidden="true">
      <div class="scroll-mouse">
        <div class="scroll-wheel"></div>
      </div>
      <span class="scroll-label">Scroll</span>
    </div>
  </section>
</template>

<script setup>
import anime from 'animejs'
import { onMounted, onUnmounted, ref } from 'vue'
import SigerDecor from './SigerDecor.vue'

const heroSection = ref(null)
const videoEl     = ref(null)
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const contentEl   = ref(null)
const badgeEl     = ref(null)
const line1El     = ref(null)
const line2El     = ref(null)
const taglineEl   = ref(null)
const actionsEl   = ref(null)
const scrollEl    = ref(null)

// biome-ignore lint/correctness/noUnusedVariables: Used in template
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// Video parallax on scroll (passive, rAF-throttled)
let ticking = false
const onScrollParallax = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    if (!videoEl.value || !heroSection.value) return
    const rect = heroSection.value.getBoundingClientRect()
    if (rect.bottom < 0) return
    const p = Math.max(0, Math.min(1, -rect.top / rect.height))
    videoEl.value.style.transform = `scale(1.08) translateY(${p * 40}px)`
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScrollParallax, { passive: true })

  // Video entrance
  if (videoEl.value) {
    anime({
      targets: videoEl.value,
      scale: [1.14, 1.08],
      opacity: [0, 1],
      duration: 2800,
      easing: 'easeOutQuart',
    })
  }

  // Master cinematic timeline
  anime.timeline({ easing: 'easeOutExpo' })
    // Badge: slide desde baixo com fade
    .add({
      targets: badgeEl.value,
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 700,
      delay: 400,
      easing: 'easeOutBack',
    })
    // Linha 1 "Umbul": cortar de baixo para cima
    .add({
      targets: line1El.value,
      clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 900,
      easing: 'easeOutQuart',
    }, '-=300')
    // Linha 2 "Limus": delay pequeno + skew reset
    .add({
      targets: line2El.value,
      clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
      translateY: [40, 0],
      opacity: [0, 1],
      skewX: ['-3deg', '0deg'],
      duration: 950,
      easing: 'easeOutQuart',
    }, '-=650')
    // Tagline: blur-to-sharp
    .add({
      targets: taglineEl.value,
      opacity: [0, 1],
      translateY: [20, 0],
      filter: ['blur(6px)', 'blur(0px)'],
      duration: 800,
      easing: 'easeOutQuart',
    }, '-=500')
    // Buttons: stagger scale bounce
    .add({
      targets: actionsEl.value?.querySelectorAll('a'),
      opacity: [0, 1],
      scale: [0.8, 1.04, 1],
      translateY: [12, 0],
      delay: anime.stagger(120),
      duration: 700,
      easing: 'easeOutBack',
    }, '-=450')
    // Scroll hint
    .add({
      targets: scrollEl.value,
      opacity: [0, 0.7],
      translateY: [10, 0],
      duration: 600,
    }, '-=200')
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScrollParallax)
})

defineExpose({ SigerDecor })
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%; height: 100vh; min-height: 620px;
  display: flex; align-items: flex-end;
  overflow: hidden;
  background: var(--c-dark-bg);
}

.hero-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; z-index: 0;
  opacity: 0;
  transform: scale(1.08);
  will-change: transform;
}

.hero-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(
    to top,
    rgba(7, 24, 4, 0.96) 0%,
    rgba(7, 24, 4, 0.55) 40%,
    rgba(7, 24, 4, 0.15) 70%,
    rgba(7, 24, 4, 0.05) 100%
  );
}

/* Grain texture */
.hero-grain {
  position: absolute; inset: 0; z-index: 2;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px;
}

.hero-siger-bg {
  position: absolute;
  bottom: 4rem; right: var(--sp-md);
  z-index: 2; pointer-events: none;
}

.hero-content {
  position: relative; z-index: 3;
  max-width: var(--max-w); width: 100%;
  margin: 0 auto;
  padding: clamp(6.5rem, 12vh, 8.5rem) var(--sp-md) clamp(3rem, 6vh, 5rem);
}

/* Badge */
.hero-badge-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.75rem;
  opacity: 0;
}
.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--c-siger);
  box-shadow: 0 0 8px 2px rgba(212, 168, 83, 0.6);
  animation: dotPulse 2.4s ease-in-out infinite;
}
@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}
.hero-badge {
  font-family: var(--font-sans);
  font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: var(--c-siger);
  border: 1px solid rgba(212, 168, 83, 0.3);
  padding: 0.3rem 0.8rem; border-radius: 50px;
}

/* Title */
.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(4.5rem, 13vw, 10rem);
  font-weight: 700;
  line-height: 0.9;
  margin-bottom: 1.75rem;
  display: flex; flex-direction: column;
}
.title-line {
  display: block;
  overflow: hidden;
  opacity: 0;
}
.title-line--1 .title-word { color: var(--c-cream); display: block; }
.title-line--2 { padding-left: 1.2rem; }
.title-line--2 em { font-style: italic; color: var(--c-sage-light); display: block; }

/* Tagline */
.hero-tagline {
  font-size: clamp(0.9rem, 2vw, 1.05rem);
  color: rgba(237, 250, 233, 0.68);
  max-width: 440px;
  margin-bottom: 2.5rem;
  line-height: 1.75;
  opacity: 0;
}

/* Actions */
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn-primary {
  opacity: 0;
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--c-terra); color: var(--c-white);
  padding: 0.85rem 1.8rem; border-radius: 50px;
  font-size: 0.88rem; font-weight: 600;
  transition: var(--transition);
  text-decoration: none;
}
.btn-primary:hover {
  background: var(--c-terra-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(38, 181, 21, 0.35);
}

.btn-ghost {
  opacity: 0;
  display: inline-flex; align-items: center; gap: 0.5rem;
  border: 1.5px solid rgba(212, 168, 83, 0.45);
  color: var(--c-siger);
  padding: 0.85rem 1.8rem; border-radius: 50px;
  font-size: 0.88rem; font-weight: 500;
  transition: var(--transition);
  text-decoration: none;
}
.btn-ghost:hover {
  border-color: var(--c-siger);
  background: var(--c-siger-glow);
  transform: translateY(-2px);
}

.btn-icon { flex-shrink: 0; }

/* Scroll indicator */
.hero-scroll {
  position: absolute; bottom: 2.5rem; left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  opacity: 0;
}
.scroll-mouse {
  width: 22px; height: 36px;
  border: 1.5px solid rgba(237, 250, 233, 0.3);
  border-radius: 11px;
  display: flex; justify-content: center;
  padding-top: 6px;
}
.scroll-wheel {
  width: 3px; height: 7px;
  background: var(--c-siger);
  border-radius: 2px;
  animation: wheelScroll 2s ease-in-out infinite;
}
@keyframes wheelScroll {
  0% { opacity: 1; transform: translateY(0); }
  60% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 0; transform: translateY(0); }
}
.scroll-label {
  font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(237, 250, 233, 0.35);
}

@media (max-width: 768px) {
  .hero-scroll { display: none; }
}

@media (max-width: 600px) {
  .hero-content { padding: 0 1.25rem 2.5rem; }
  .title-line--2 { padding-left: 0.75rem; }
  .hero-siger-bg { display: none; }
  .hero-tagline br { display: none; }
  .hero-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  .btn-primary,
  .btn-ghost {
    width: 100%;
    justify-content: center;
    padding: 0.85rem 1.25rem;
  }
}
</style>
