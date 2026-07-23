<template>
  <section id="infografis" class="infografis-section">
    <div class="infografis-container">
      <header class="infografis-header" ref="headerEl">
        <span class="section-label">Data Desa</span>
        <h2 class="section-title">Infografis Umbul Limus</h2>
        <p class="infografis-desc">Data kependudukan dan profil desa tahun {{ data.tahun_data }}.</p>
      </header>

      <div v-if="data.kependudukan" class="infografis-grid" ref="gridEl">
        <!-- Kependudukan -->
        <div class="info-card info-card--kependudukan">
          <h3 class="info-card-title">Kependudukan</h3>
          <div class="kependudukan-stats">
            <div class="kependudukan-total">
              <span class="big-number">{{ data.kependudukan.total.toLocaleString('id-ID') }}</span>
              <span class="big-label">Total Jiwa</span>
            </div>
            <div class="kependudukan-detail">
              <div v-for="(item, idx) in data.kependudukan.rincian" :key="idx" class="detail-row">
                <span class="detail-icon" v-if="item.label.includes('Laki')">👨</span>
                <span class="detail-icon" v-else-if="item.label.includes('Perem')">👩</span>
                <span class="detail-icon" v-else-if="item.label.includes('Keluarga')">🏠</span>
                <span class="detail-icon" v-else>🔸</span>
                <span class="detail-label">{{ item.label }}</span>
                <span class="detail-val">{{ item.value.toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pendidikan Bar -->
        <div class="info-card info-card--pendidikan">
          <h3 class="info-card-title">Tingkat Pendidikan</h3>
          <div class="bar-chart" v-if="data.pendidikan">
            <div
              v-for="item in pendidikanItems"
              :key="item.key"
              class="bar-row"
            >
              <span class="bar-label">{{ item.label }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ width: barWidth(item.value) + '%', background: item.color }"
                ></div>
              </div>
              <span class="bar-val">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- Pekerjaan -->
        <div class="info-card info-card--pekerjaan">
          <h3 class="info-card-title">Mata Pencaharian</h3>
          <div class="pekerjaan-list" v-if="data.pekerjaan">
            <div class="pekerjaan-item" v-for="item in pekerjaanItems" :key="item.key">
              <span class="pekerjaan-icon">{{ item.icon }}</span>
              <div class="pekerjaan-info">
                <span class="pekerjaan-label">{{ item.label }}</span>
                <div class="pekerjaan-bar-track">
                  <div class="pekerjaan-bar-fill" :style="{ width: pekerjaanWidth(item.value) + '%' }"></div>
                </div>
              </div>
              <span class="pekerjaan-val">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- Wilayah -->
        <div class="info-card info-card--wilayah">
          <h3 class="info-card-title">Wilayah</h3>
          <div class="wilayah-grid" v-if="data.wilayah">
            <div v-for="(item, idx) in data.wilayah" :key="idx" class="wilayah-item">
              <span class="wilayah-num">{{ typeof item.value === 'number' ? item.value.toLocaleString('id-ID') : item.value.replace(/[^0-9.,]/g, '') }}</span>
              <span class="wilayah-label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="infografis-loading">Memuat data infografis...</p>
    </div>
  </section>
</template>

<script setup>
import anime from 'animejs';
import { computed, onMounted, ref } from 'vue';

const data = ref({});
const headerEl = ref(null);
const gridEl = ref(null);

const pendidikanItems = computed(() => {
  if (!data.value.pendidikan) return [];
  const colors = ['#c0856e', '#a06a55', '#7a4a3a', '#4a6741', '#3a5234'];
  return data.value.pendidikan.map((item, idx) => ({
    key: item.label,
    label: item.label,
    value: item.value,
    color: colors[idx % colors.length]
  }));
});

const pekerjaanItems = computed(() => {
  if (!data.value.pekerjaan) return [];
  return data.value.pekerjaan.map(item => ({
    key: item.label,
    label: item.label,
    value: item.value,
    icon: item.icon || '🔸'
  }));
});

const maxPendidikan = computed(() => Math.max(...(pendidikanItems.value.map(i => i.value) || [1])));
const maxPekerjaan = computed(() => Math.max(...(pekerjaanItems.value.map(i => i.value) || [1])));
const barWidth = (v) => Math.round((v / maxPendidikan.value) * 100);
const pekerjaanWidth = (v) => Math.round((v / maxPekerjaan.value) * 100);

defineExpose({ barWidth, pekerjaanWidth });

onMounted(async () => {
  try {
    const res = await fetch('/data/infografis/data.json');
    if (res.ok) data.value = await res.json();
  } catch (e) {
    console.error('Gagal memuat infografis:', e);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      anime({
        targets: gridEl.value?.querySelectorAll('.info-card'),
        opacity: [0, 1],
        translateY: [24, 0],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutExpo'
      });
      anime({
        targets: '.bar-fill, .pekerjaan-bar-fill',
        width: ['0%', (el) => el.style.width],
        duration: 1000,
        delay: anime.stagger(80, { start: 300 }),
        easing: 'easeOutExpo'
      });
    });
  }, { threshold: 0.1 });

  if (headerEl.value) {
    anime({ targets: headerEl.value, opacity: [0,1], translateY: [20,0], duration: 600, easing: 'easeOutExpo' });
  }
  setTimeout(() => { if (gridEl.value) observer.observe(gridEl.value); }, 100);
});
</script>

<style scoped>
.infografis-section {
  background: var(--c-cream);
  padding: var(--sp-xl) var(--sp-md);
}

.infografis-container {
  max-width: var(--max-w);
  margin: 0 auto;
}

.infografis-header { margin-bottom: 3rem; }
.infografis-desc { color: var(--c-stone-muted); margin-top: 0.5rem; }
.infografis-loading { text-align: center; color: var(--c-stone-muted); padding: 3rem; }

.infografis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.info-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  box-shadow: var(--shadow-card);
  opacity: 0;
}

.info-card-title {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: var(--c-stone);
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1.5px solid var(--c-cream-dark);
}

/* Kependudukan */
.kependudukan-stats { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
.kependudukan-total { display: flex; flex-direction: column; }
.big-number { font-family: var(--font-serif); font-size: 3rem; font-weight: 700; color: var(--c-terra-dark); line-height: 1; }
.big-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--c-stone-muted); margin-top: 0.3rem; }
.kependudukan-detail { display: flex; flex-direction: column; gap: 0.6rem; }
.detail-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: var(--c-stone-muted); }
.detail-val { margin-left: auto; font-weight: 600; color: var(--c-stone); }

/* Bar chart */
.bar-chart { display: flex; flex-direction: column; gap: 0.75rem; }
.bar-row { display: flex; align-items: center; gap: 0.75rem; }
.bar-label { font-size: 0.8rem; color: var(--c-stone-muted); width: 100px; flex-shrink: 0; }
.bar-track { flex: 1; background: var(--c-cream-dark); border-radius: 99px; height: 8px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
.bar-val { font-size: 0.8rem; font-weight: 600; color: var(--c-stone); width: 36px; text-align: right; }

/* Pekerjaan */
.pekerjaan-list { display: flex; flex-direction: column; gap: 0.8rem; }
.pekerjaan-item { display: flex; align-items: center; gap: 0.75rem; }
.pekerjaan-icon { font-size: 1.1rem; }
.pekerjaan-info { flex: 1; }
.pekerjaan-label { display: block; font-size: 0.82rem; color: var(--c-stone-muted); margin-bottom: 0.25rem; }
.pekerjaan-bar-track { background: var(--c-cream-dark); height: 6px; border-radius: 99px; overflow: hidden; }
.pekerjaan-bar-fill { height: 100%; background: var(--c-sage); border-radius: 99px; }
.pekerjaan-val { font-size: 0.82rem; font-weight: 600; color: var(--c-stone); width: 36px; text-align: right; }

/* Wilayah */
.wilayah-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.wilayah-item { display: flex; flex-direction: column; text-align: center; padding: 1rem; background: var(--c-cream); border-radius: var(--radius-sm); }
.wilayah-num { font-family: var(--font-serif); font-size: 2rem; font-weight: 700; color: var(--c-terra-dark); }
.wilayah-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--c-stone-muted); margin-top: 0.25rem; }

@media (max-width: 768px) {
  .infografis-grid { grid-template-columns: 1fr; }
}
</style>
