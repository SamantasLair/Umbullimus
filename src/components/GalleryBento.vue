<template>
  <section id="galeri" class="gallery-section">
    <div class="gallery-container">
      <header class="gallery-header js-reveal" ref="headerEl">
        <span class="section-label">Galeri</span>
        <h2 class="section-title on-dark">Keindahan Umbul Limus</h2>
      </header>

      <div v-if="!loading" class="bento-grid" ref="gridEl">
        <figure
          v-for="(item, i) in items"
          :key="item.id"
          class="bento-item"
          :class="bentoClass(i)"
        >
          <img :src="item.gambar" :alt="item.judul" loading="lazy" />
          <figcaption>
            <span class="bento-title">{{ item.judul }}</span>
            <span class="bento-desc">{{ item.deskripsi }}</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import anime from 'animejs';

const items = ref([]);
const loading = ref(true);
const headerEl = ref(null);
const gridEl = ref(null);

const bentoClass = (i) => {
  const pattern = ['wide', 'tall', 'square', 'square', 'wide', 'tall'];
  return 'bento-' + (pattern[i % pattern.length] || 'square');
};

onMounted(async () => {
  try {
    const res = await fetch('/data/gallery/list.json');
    if (res.ok) items.value = await res.json();
  } catch (e) {
    console.error('Gagal memuat galeri:', e);
  } finally {
    loading.value = false;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      anime({
        targets: headerEl.value,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
        easing: 'easeOutExpo'
      });
      setTimeout(() => {
        if (!gridEl.value) return;
        anime({
          targets: gridEl.value.querySelectorAll('.bento-item'),
          opacity: [0, 1],
          scale: [0.96, 1],
          delay: anime.stagger(80, { start: 100 }),
          duration: 600,
          easing: 'easeOutExpo'
        });
      }, 150);
    });
  }, { threshold: 0.1 });

  if (headerEl.value) observer.observe(headerEl.value);
});
</script>

<style scoped>
.gallery-section {
  background: var(--c-sage);
  padding: var(--sp-xl) var(--sp-md);
}

.gallery-container {
  max-width: var(--max-w);
  margin: 0 auto;
}

.gallery-header {
  margin-bottom: 2.5rem;
  opacity: 0;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 220px;
  gap: 0.75rem;
}

.bento-item {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  cursor: pointer;
  opacity: 0;
}
.bento-item img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.bento-item:hover img { transform: scale(1.06); }

.bento-item figcaption {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(30,15,8,0.8) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.25rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.bento-item:hover figcaption { opacity: 1; }

.bento-title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--c-white);
  font-weight: 600;
}
.bento-desc {
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.75);
  margin-top: 0.25rem;
}

/* Bento layout variants */
.bento-wide { grid-column: span 2; }
.bento-tall { grid-row: span 2; }
.bento-square { grid-column: span 1; }

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 180px;
  }
  .bento-wide { grid-column: span 2; }
  .bento-tall { grid-row: span 1; }
}
@media (max-width: 480px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-wide, .bento-tall { grid-column: span 1; grid-row: span 1; }
}
</style>
