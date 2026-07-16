<template>
  <section id="bagan" class="bagan-section">
    <div class="bagan-container">
      <header class="bagan-header js-reveal" ref="headerEl">
        <span class="section-label">Organisasi</span>
        <h2 class="section-title">Struktur Pemerintahan Desa</h2>
        <p class="bagan-desc">Desa Umbul Limus, Kecamatan {{ data.kecamatan }}, Kabupaten {{ data.kabupaten }}.</p>
      </header>

      <div v-if="data.kepala_desa" class="bagan-tree" ref="treeEl">
        <!-- Level 1: Kepala Desa -->
        <div class="bagan-level bagan-level--1">
          <div class="bagan-node node--kepala">
            <span class="node-jabatan">{{ data.kepala_desa.jabatan }}</span>
            <span class="node-nama">{{ data.kepala_desa.nama }}</span>
          </div>
        </div>

        <!-- Connector -->
        <div class="connector-v"></div>

        <!-- Level 2: Sekretaris -->
        <div class="bagan-level bagan-level--2">
          <div class="bagan-node node--sekretaris">
            <span class="node-jabatan">{{ data.sekretaris_desa.jabatan }}</span>
            <span class="node-nama">{{ data.sekretaris_desa.nama }}</span>
          </div>
        </div>

        <!-- Connector branch -->
        <div class="connector-branch">
          <div class="connector-h"></div>
        </div>

        <!-- Level 3: Kaur & Kasi (berdampingan) -->
        <div class="bagan-level bagan-level--3">
          <div class="bagan-group">
            <span class="group-label">Kaur</span>
            <div class="bagan-node node--staff" v-for="k in data.kaur" :key="k.jabatan">
              <span class="node-jabatan">{{ k.jabatan }}</span>
              <span class="node-nama">{{ k.nama }}</span>
            </div>
          </div>
          <div class="bagan-group">
            <span class="group-label">Kasi</span>
            <div class="bagan-node node--staff" v-for="k in data.kasi" :key="k.jabatan">
              <span class="node-jabatan">{{ k.jabatan }}</span>
              <span class="node-nama">{{ k.nama }}</span>
            </div>
          </div>
        </div>

        <!-- Level 4: Kadus -->
        <div class="bagan-level bagan-level--4">
          <div class="bagan-group bagan-group--full">
            <span class="group-label">Kepala Dusun</span>
            <div class="kadus-row">
              <div class="bagan-node node--kadus" v-for="k in data.kadus" :key="k.jabatan">
                <span class="node-jabatan">{{ k.jabatan }}</span>
                <span class="node-nama">{{ k.nama }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="bagan-loading">Memuat data struktur...</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import anime from 'animejs';

const data = ref({});
const headerEl = ref(null);
const treeEl = ref(null);

onMounted(async () => {
  try {
    const res = await fetch('/data/bagan/struktur.json');
    if (res.ok) data.value = await res.json();
  } catch (e) {
    console.error('Gagal memuat data bagan:', e);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      anime({
        targets: entry.target.querySelectorAll('.bagan-node, .connector-v, .connector-branch, .group-label'),
        opacity: [0, 1],
        translateY: [15, 0],
        delay: anime.stagger(60),
        duration: 500,
        easing: 'easeOutExpo'
      });
    });
  }, { threshold: 0.1 });

  if (headerEl.value) {
    anime({ targets: headerEl.value, opacity: [0,1], translateY: [20,0], duration: 600, easing: 'easeOutExpo', delay: 200 });
  }
  setTimeout(() => { if (treeEl.value) observer.observe(treeEl.value); }, 200);
});
</script>

<style scoped>
.bagan-section {
  background: var(--c-cream-dark);
  padding: var(--sp-xl) var(--sp-md);
}

.bagan-container {
  max-width: var(--max-w-sm);
  margin: 0 auto;
}

.bagan-header { margin-bottom: 3rem; }

.bagan-desc {
  color: var(--c-stone-muted);
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.bagan-loading { text-align: center; color: var(--c-stone-muted); }

.bagan-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.bagan-level {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Nodes */
.bagan-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.9rem 1.25rem;
  border-radius: var(--radius-md);
  min-width: 160px;
  opacity: 0;
}

.node--kepala {
  background: var(--c-terra);
  color: var(--c-white);
  min-width: 220px;
  box-shadow: var(--shadow-lift);
}

.node--sekretaris {
  background: var(--c-stone);
  color: var(--c-cream);
  min-width: 200px;
}

.node--staff {
  background: var(--c-white);
  border: 1.5px solid var(--c-cream-dark);
  box-shadow: var(--shadow-card);
}

.node--kadus {
  background: var(--c-sage);
  color: var(--c-white);
}

.node-jabatan {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.75;
  margin-bottom: 0.2rem;
}

.node-nama {
  font-family: var(--font-serif);
  font-size: 1rem;
  font-weight: 600;
}

/* Connectors */
.connector-v {
  width: 2px;
  height: 2rem;
  background: linear-gradient(to bottom, var(--c-terra), var(--c-stone));
  opacity: 0;
}

.connector-branch {
  width: 100%;
  position: relative;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}
.connector-h {
  width: 70%;
  height: 2px;
  background: var(--c-stone-muted);
  position: relative;
}
.connector-h::before,
.connector-h::after {
  content: '';
  position: absolute;
  top: 0;
  width: 2px;
  height: 1.5rem;
  background: var(--c-stone-muted);
}
.connector-h::before { left: 0; }
.connector-h::after { right: 0; }

/* Groups */
.bagan-level--3 {
  gap: 3rem;
  align-items: flex-start;
  margin-top: 0;
}

.bagan-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.bagan-group--full { width: 100%; }

.group-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-stone-muted);
  margin-bottom: 0.2rem;
  opacity: 0;
}

.kadus-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Spacing between levels */
.bagan-level--2 { margin-top: 0; }
.bagan-level--3 { margin-top: 1.5rem; }
.bagan-level--4 { margin-top: 2rem; }

@media (max-width: 600px) {
  .bagan-level--3 { flex-direction: column; align-items: center; gap: 2rem; }
  .bagan-node { min-width: 140px; }
}
</style>
