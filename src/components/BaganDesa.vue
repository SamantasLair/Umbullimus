<template>
  <section id="bagan" class="bagan-section" ref="sectionRef">
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
import anime from "animejs";
import { nextTick, onMounted, ref } from "vue";
import { useScrollExit } from "../composables/useScrollExit.js";

const data = ref({});
const sectionRef = ref(null);
const headerEl = ref(null);
const treeEl = ref(null);

const resetElements = () => {
	if (headerEl.value) {
		headerEl.value.style.opacity = "0";
		headerEl.value.style.transform = "";
	}
	Array.from(getLevels()).forEach((el) => {
		el.style.opacity = "0";
		el.style.transform = "";
	});
};

const getLevels = () =>
	treeEl.value
		? treeEl.value.querySelectorAll(
				".bagan-level, .connector-v, .connector-branch",
			)
		: [];

const animateIn = () => {
	if (!treeEl.value) return;

	const connV   = treeEl.value.querySelector('.connector-v');
	const connB   = treeEl.value.querySelector('.connector-branch');
	const lvl1    = treeEl.value.querySelector('.bagan-level--1');
	const lvl2    = treeEl.value.querySelector('.bagan-level--2');
	const lvl3    = treeEl.value.querySelector('.bagan-level--3');
	const lvl4    = treeEl.value.querySelector('.bagan-level--4');
	const nodes   = treeEl.value.querySelectorAll('.bagan-node');
	const labels  = treeEl.value.querySelectorAll('.group-label');

	// Timeline: Header → Level1 pop → Connector draw → Level2 → Branch → Level3/4
	anime.timeline({ easing: 'easeOutExpo' })
		.add({
			targets:    headerEl.value,
			opacity:    [0, 1],
			translateY: [20, 0],
			duration:   600,
		})
		// Kepala desa: scale pop dramatis
		.add({
			targets:  lvl1,
			opacity:  [0, 1],
			scale:    [0, 1.08, 1],
			duration: 650,
			easing:   'easeOutElastic',
		}, '-=200')
		// Connector V: tumbuh dari atas (draw)
		.add({
			targets:         connV,
			opacity:         [0, 1],
			scaleY:          [0, 1],
			transformOrigin: ['top center', 'top center'],
			duration:        380,
			easing:          'easeInOutQuart',
		}, '-=100')
		// Level 2 Sekretaris
		.add({
			targets:  lvl2,
			opacity:  [0, 1],
			scale:    [0.85, 1.04, 1],
			duration: 550,
			easing:   'easeOutBack',
		}, '-=50')
		// Connector branch: tumbuh dari tengah
		.add({
			targets:         connB,
			opacity:         [0, 1],
			scaleX:          [0, 1],
			transformOrigin: ['center center', 'center center'],
			duration:        420,
			easing:          'easeInOutQuart',
		}, '-=100')
		// Level 3 & 4: cascade dari atas
		.add({
			targets:  [lvl3, lvl4].filter(Boolean),
			opacity:  [0, 1],
			translateY: [16, 0],
			scaleY:   [0.88, 1],
			transformOrigin: ['top center', 'top center'],
			delay:    anime.stagger(160),
			duration: 550,
			easing:   'easeOutBack',
		}, '-=150')
		// Labels & nodes: final appear
		.add({
			targets:  [...nodes, ...labels],
			opacity:  [0, 1],
			translateY: [8, 0],
			delay:    anime.stagger(40),
			duration: 400,
		}, '-=300');
};

// Scroll-linked PHYSICAL exit — pohon bagan "runtuh" ke atas, level demi level
// Masuk: tumbuh dari atas (scaleY) — Keluar: runtuh ke atas, dipercepat dari bawah ke atas
// getLevels() dipanggil LAZY saat scroll agar treeEl.value sudah ada
useScrollExit(
	sectionRef,
	() => {
		const levels = Array.from(getLevels());
		return [
			{ el: headerEl.value, x: 0, y: -80 },
			// Level paling bawah exit lebih jauh (inverse dari entrance top-to-bottom)
			...levels.map((el, i) => ({
				el,
				x: (i % 2 === 0 ? -1 : 1) * i * 8, // zigzag kiri-kanan ringan
				y: -60 - i * 30, // semakin dalam levelnya, semakin jauh exitnya
				rotate: (i % 2 === 0 ? -1 : 1) * 2,
			})),
		];
	},
	{ exitZone: 190, staggerPx: 16 },
);


onMounted(async () => {
	try {
		const res = await fetch("/data/bagan/struktur.json");
		if (res.ok) data.value = await res.json();
	} catch (e) {
		console.error("Gagal memuat data bagan:", e);
	}

	await nextTick();
	if (headerEl.value) {
		headerEl.value.style.opacity = "0";
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					resetElements();
					animateIn();
					// TIDAK unobserve — animasi harus bisa berulang
				}
			});
		},
		{ threshold: 0.15 },
	);

	if (headerEl.value) observer.observe(headerEl.value);

	// Dots — looping gentle float
	const dots = sectionRef.value?.querySelectorAll('.bg-dot');
	if (dots?.length) {
		anime({
			targets:    dots,
			translateY: (_, i) => [0, -18 - i * 6],
			translateX: (_, i) => [0, (i % 2 === 0 ? 10 : -10)],
			opacity:    [0.15, 0.45],
			scale:      [1, 1.4],
			duration:   (_, i) => 2800 + i * 380,
			delay:      anime.stagger(300, { from: 'random' }),
			loop:       true,
			direction:  'alternate',
			easing:     'easeInOutSine',
		});
	}
});
</script>

<style scoped>
.bagan-section {
  background: var(--c-cream-dark);
  padding: var(--sp-xl) var(--sp-md);
  position: relative;
  overflow: visible;
  z-index: 1;
}

.bagan-container {
  max-width: var(--max-w-sm);
  margin: 0 auto;
  position: relative; z-index: 1;
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
  background: var(--c-terra-dark);
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
  background: var(--c-terra-dark);
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
