<template>
  <section id="wisata" class="wisata-section">
    <div class="wisata-container">
      <header class="wisata-header js-reveal" ref="headerEl">
        <span class="section-label">Destinasi</span>
        <h2 class="section-title">Tempat Wisata</h2>
        <p class="wisata-desc">Jelajahi keindahan alam dan kekayaan budaya yang menanti Anda di Umbul Limus.</p>
      </header>

      <div v-if="loading" class="wisata-loading">Memuat data...</div>

      <div v-else class="wisata-grid">
        <article
          v-for="(place, i) in places"
          :key="place.id"
          class="wisata-card js-reveal"
          :ref="el => { if(el) cardEls.push(el) }"
          :style="{ '--delay': i * 0.1 + 's' }"
        >
          <div class="card-image">
            <img :src="place.gambar" :alt="place.nama" loading="lazy" />
            <span class="card-kategori">{{ place.kategori }}</span>
          </div>
          <div class="card-body">
            <h3 class="card-nama">{{ place.nama }}</h3>
            <p class="card-desc">{{ place.deskripsi }}</p>
            <div class="card-meta">
              <span>🕐 {{ place.jam_buka }}</span>
              <span>🎟 {{ place.tiket }}</span>
            </div>
            <ul class="card-fasilitas">
              <li v-for="f in place.fasilitas" :key="f">{{ f }}</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import anime from 'animejs';
import { onMounted, ref } from 'vue';

const places = ref([]);
const loading = ref(true);
const headerEl = ref(null);
const cardEls = ref([]);

onMounted(async () => {
  try {
    const res = await fetch('/data/tempat-wisata/list.json');
    if (res.ok) places.value = await res.json();
  } catch (e) {
    console.error('Gagal memuat data wisata:', e);
  } finally {
    loading.value = false;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      anime({
        targets: entry.target,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 700,
        easing: 'easeOutExpo'
      });
    });
  }, { threshold: 0.1 });

  if (headerEl.value) observer.observe(headerEl.value);
  setTimeout(() => {
    cardEls.value.forEach(el => { if (el) observer.observe(el); });
  }, 100);
});
</script>

<style scoped>
.wisata-section {
  background: var(--c-cream);
  padding: var(--sp-xl) var(--sp-md);
}

.wisata-container {
  max-width: var(--max-w);
  margin: 0 auto;
}

.wisata-header {
  max-width: 540px;
  margin-bottom: 3.5rem;
  opacity: 0;
}

.wisata-desc {
  color: var(--c-stone-muted);
  margin-top: 0.75rem;
  font-size: 1rem;
}

.wisata-loading {
  text-align: center;
  color: var(--c-stone-muted);
  padding: 3rem;
}

.wisata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.wisata-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  opacity: 0;
}
.wisata-card:hover {
  box-shadow: var(--shadow-lift);
  transform: translateY(-5px);
}

.card-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}
.card-image img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.wisata-card:hover .card-image img { transform: scale(1.05); }

.card-kategori {
  position: absolute;
  top: 1rem; left: 1rem;
  background: var(--c-terra-dark);
  color: var(--c-white);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  border-radius: 50px;
}

.card-body { padding: 1.5rem; }

.card-nama {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  color: var(--c-stone);
  margin-bottom: 0.6rem;
}

.card-desc {
  font-size: 0.9rem;
  color: var(--c-stone-muted);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-meta {
  display: flex;
  gap: 1.25rem;
  font-size: 0.8rem;
  color: var(--c-stone-muted);
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.card-fasilitas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.card-fasilitas li {
  background: var(--c-cream);
  color: var(--c-terra-dark);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  border: 1px solid var(--c-cream-dark);
}
</style>
