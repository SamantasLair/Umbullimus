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
              <span class="big-number">{{ data.kependudukan.jumlah_penduduk.toLocaleString('id-ID') }}</span>
              <span class="big-label">Total Jiwa</span>
            </div>
            <div class="kependudukan-detail">
              <div class="detail-row">
                <span class="detail-icon">👨</span>
                <span class="detail-label">Laki-laki</span>
                <span class="detail-val">{{ data.kependudukan.laki_laki.toLocaleString('id-ID') }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">👩</span>
                <span class="detail-label">Perempuan</span>
                <span class="detail-val">{{ data.kependudukan.perempuan.toLocaleString('id-ID') }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">🏠</span>
                <span class="detail-label">Jumlah KK</span>
                <span class="detail-val">{{ data.kependudukan.jumlah_kk }}</span>
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
          <div class="wilayah-grid">
            <div class="wilayah-item">
              <span class="wilayah-num">{{ data.luas_wilayah_ha?.toLocaleString('id-ID') }}</span>
              <span class="wilayah-label">Ha Luas Wilayah</span>
            </div>
            <div class="wilayah-item">
              <span class="wilayah-num">{{ data.jumlah_dusun }}</span>
              <span class="wilayah-label">Dusun</span>
            </div>
            <div class="wilayah-item">
              <span class="wilayah-num">{{ data.jumlah_rw }}</span>
              <span class="wilayah-label">RW</span>
            </div>
            <div class="wilayah-item">
              <span class="wilayah-num">{{ data.jumlah_rt }}</span>
              <span class="wilayah-label">RT</span>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="infografis-loading">Memuat data infografis...</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import anime from 'animejs';

const data = ref({});
const headerEl = ref(null);
const gridEl = ref(null);

const pendidikanItems = computed(() => {
  if (!data.value.pendidikan) return [];
  const d = data.value.pendidikan;
  return [
    { key: 'tidak_sekolah', label: 'Tidak Sekolah', value: d.tidak_sekolah, color: '#c0856e' },
    { key: 'sd', label: 'SD', value: d.sd, color: '#a06a55' },
    { key: 'smp', label: 'SMP', value: d.smp, color: '#7a4a3a' },
    { key: 'sma', label: 'SMA', value: d.sma, color: '#4a6741' },
    { key: 'pt', label: 'Perguruan Tinggi', value: d.perguruan_tinggi, color: '#3a5234' }
  ];
});

const pekerjaanItems = computed(() => {
  if (!data.value.pekerjaan) return [];
  const p = data.value.pekerjaan;
  return [
    { key: 'petani', label: 'Petani', value: p.petani, icon: '🌾' },
    { key: 'pedagang', label: 'Pedagang', value: p.pedagang, icon: '🏪' },
    { key: 'buruh', label: 'Buruh', value: p.buruh, icon: '🔧' },
    { key: 'pns', label: 'Pegawai Negeri', value: p.pegawai_negeri, icon: '🏛' },
    { key: 'wiraswasta', label: 'Wiraswasta', value: p.wiraswasta, icon: '💼' }
  ];
});

const maxPendidikan = computed(() => Math.max(...(pendidikanItems.value.map(i => i.value) || [1])));
const maxPekerjaan = computed(() => Math.max(...(pekerjaanItems.value.map(i => i.value) || [1])));
const barWidth = (v) => Math.round((v / maxPendidikan.value) * 100);
const pekerjaanWidth = (v) => Math.round((v / maxPekerjaan.value) * 100);

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
.big-number { font-family: var(--font-serif); font-size: 3rem; font-weight: 700; color: var(--c-terra); line-height: 1; }
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
.wilayah-num { font-family: var(--font-serif); font-size: 2rem; font-weight: 700; color: var(--c-sage); }
.wilayah-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--c-stone-muted); margin-top: 0.25rem; }

@media (max-width: 768px) {
  .infografis-grid { grid-template-columns: 1fr; }
}
</style>
