<template>
  <div class="info-page">
    <!-- Hero -->
    <div class="page-hero">
      <div class="page-hero__bg">
        <div class="hero-blob hero-blob--1"></div>
        <div class="hero-blob hero-blob--2"></div>
        <div class="hero-blob hero-blob--3"></div>
      </div>
      <div class="page-hero__content">
        <span class="page-hero__label">Data &amp; Fakta</span>
        <h1 class="page-hero__title">Infografis<br><em>Desa Umbul Limus</em></h1>
        <p v-if="data.tahun_data" class="page-hero__year">Pemutakhiran Data · Tahun {{ data.tahun_data }}</p>
      </div>
    </div>

    <div v-if="loading" class="info-skeleton" aria-hidden="true">
      <div class="skel-section">
        <div class="skel-penduduk">
          <div class="skeleton-box skel-spotlight-num"></div>
          <div class="skel-pills">
            <div class="skeleton-box skel-pill" v-for="n in 3" :key="n"></div>
          </div>
        </div>
      </div>
      <div class="skel-section skel-section--dark">
        <div class="skel-tiles">
          <div class="skeleton-box skel-tile" v-for="n in 4" :key="n"></div>
        </div>
      </div>
      <div class="skel-section">
        <div class="skel-bars">
          <div class="skeleton-box skel-bar" v-for="n in 5" :key="n" :style="{ width: (38 + n * 11) + '%' }"></div>
        </div>
      </div>
      <div class="skel-section skel-section--cream-dark">
        <div class="skel-rings">
          <div class="skeleton-box skel-ring" v-for="n in 5" :key="n"></div>
        </div>
      </div>
    </div>

    <div v-else class="info-body">

      <!-- 1. Kependudukan (Hanya tampil jika ada data.kependudukan) -->
      <section v-if="data.kependudukan" class="info-section" ref="secPenduduk">
        <div class="info-wrap">
          <div class="sec-header"><span class="section-label">Penduduk</span><h2 class="section-title">Kependudukan</h2></div>
          <div class="penduduk-layout">
            <div class="penduduk-spotlight">
              <span class="spotlight-num" ref="pendudukNumEl">0</span>
              <span class="spotlight-unit">{{ data.kependudukan.satuan || 'Jiwa' }}</span>
              <p class="spotlight-caption">{{ data.kependudukan.keterangan }}</p>
            </div>
            
            <div v-if="data.kependudukan.rincian && data.kependudukan.rincian.length" class="penduduk-pills">
              <!-- Loop rincian dinamis dari JSON -->
              <div v-for="(item, idx) in data.kependudukan.rincian" :key="item.label" :class="['pill', 'pill--' + pillColors[idx % pillColors.length]]">
                <div>
                  <span class="pill__val">{{ typeof item.value === 'number' ? item.value.toLocaleString('id-ID') : item.value }}</span>
                  <span class="pill__label">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Wilayah (Hanya tampil jika ada data.wilayah) -->
      <section v-if="data.wilayah && data.wilayah.length" class="info-section info-section--dark" ref="secWilayah">
        <div class="info-wrap">
          <div class="sec-header"><span class="section-label" style="color:var(--c-terra)">Wilayah</span><h2 class="section-title on-dark">Profil Wilayah</h2></div>
          <div class="wilayah-tiles">
            <!-- Loop wilayah dinamis dari JSON -->
            <div v-for="t in data.wilayah" :key="t.label" class="wtile">
              <span class="wtile__icon" v-if="t.icon">{{ t.icon }}</span>
              <span class="wtile__num">{{ typeof t.value === 'number' ? t.value.toLocaleString('id-ID') : t.value }}</span>
              <span class="wtile__label">{{ t.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Pendidikan (Hanya tampil jika ada data.pendidikan) -->
      <section v-if="data.pendidikan && data.pendidikan.length" class="info-section" ref="secPendidikan">
        <div class="info-wrap info-wrap--split">
          <div>
            <span class="section-label">Pendidikan</span>
            <h2 class="section-title">Tingkat Pendidikan<br>Warga Desa</h2>
            <p class="info-desc">Distribusi jenjang pendidikan formal penduduk berdasarkan data terkini.</p>
          </div>
          <div class="bar-chart">
            <!-- Loop pendidikan dinamis dari JSON -->
            <div v-for="(item, idx) in pendidikanBars" :key="item.label" class="bar-row">
              <span class="bar-label">{{ item.label }}</span>
              <div class="bar-track">
                <div class="bar-fill" :data-width="item.pct" :style="{ background: barColors[idx % barColors.length] }"></div>
              </div>
              <span class="bar-val">{{ typeof item.value === 'number' ? item.value.toLocaleString('id-ID') : item.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Pekerjaan (Hanya tampil jika ada data.pekerjaan) -->
      <section v-if="pekerjaanList.length" class="info-section info-section--cream-dark" ref="secPekerjaan">
        <div class="info-wrap">
          <div class="sec-header"><span class="section-label">Ekonomi</span><h2 class="section-title">Mata Pencaharian</h2></div>
          <div class="pekerjaan-grid">
            <!-- Loop pekerjaan dinamis dari JSON -->
            <div v-for="(item, i) in pekerjaanList" :key="item.label" class="pcard">
              <div class="pcard__ring">
                <svg viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--c-cream-dark)" stroke-width="3.2"/>
                  <circle
                    cx="18" cy="18" r="15.9"
                    fill="none"
                    :stroke="donutColors[i % donutColors.length]"
                    stroke-width="3.2"
                    stroke-dasharray="100"
                    stroke-dashoffset="100"
                    stroke-linecap="round"
                    transform="rotate(-90 18 18)"
                    class="ring-arc"
                    :data-offset="100 - item.pct"
                  />
                </svg>
                <span class="pcard__pct">{{ item.pct }}%</span>
              </div>
              <span class="pcard__icon" v-if="item.icon">{{ item.icon }}</span>
              <span class="pcard__val">{{ typeof item.value === 'number' ? item.value.toLocaleString('id-ID') : item.value }}</span>
              <span class="pcard__label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Wisata Stats (Hanya tampil jika ada data.wisata) -->
      <section v-if="data.wisata && data.wisata.length" class="info-section info-section--terra" ref="secWisata">
        <div class="info-wrap">
          <div class="sec-header"><span class="section-label" style="color:rgba(245,240,232,.55)">Pariwisata</span><h2 class="section-title on-dark">Potensi Wisata</h2></div>
          <div class="wisata-row">
            <!-- Loop wisata dinamis dari JSON -->
            <div v-for="(s, idx) in data.wisata" :key="s.label" class="wstat">
              <span class="wstat__num" :ref="el => { if (el) wstatEls[idx] = { el, target: s.value } }">0</span>
              <span class="wstat__suffix" v-if="s.suffix">{{ s.suffix }}</span>
              <span class="wstat__label">{{ s.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Google Maps (Hanya tampil jika ada data.maps_embed) -->
      <section v-if="data.maps_embed" class="info-section info-section--maps" ref="secMaps">
        <div class="info-wrap">
          <div class="sec-header">
            <span class="section-label">Lokasi</span>
            <h2 class="section-title">Temukan Kami</h2>
            <p v-if="data.maps_label" class="info-desc">{{ data.maps_label }}</p>
          </div>
          <div class="maps-wrapper">
            <iframe
              :src="data.maps_embed"
              class="maps-iframe"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Lokasi Desa di Google Maps"
            ></iframe>
            <div class="maps-actions">
              <a
                href="https://maps.google.com/?q=Umbul+Limus+Pesawaran+Lampung"
                target="_blank"
                rel="noopener"
                class="maps-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import anime from "animejs";
import { computed, onMounted, ref } from "vue";

const data = ref({});
const loading = ref(true);

const pendudukNumEl = ref(null);
const wstatEls = ref([]);

const secPenduduk = ref(null);
const secWilayah = ref(null);
const secPendidikan = ref(null);
const secPekerjaan = ref(null);
const secWisata = ref(null);
const secMaps = ref(null);

/* Palet warna dinamis */
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const pillColors = ["sage", "terra", "stone"];
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const barColors = ["#c4917a", "#a06a55", "#7a4a3a", "#4a6741", "#2e4428"];
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const donutColors = ["#7a4a3a", "#4a6741", "#2c2420", "#a06a55", "#3a5234"];

/* Hitung persentase dinamis untuk Pendidikan */
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const pendidikanBars = computed(() => {
	if (!data.value.pendidikan?.length) return [];
	const max = Math.max(...data.value.pendidikan.map((item) => item.value || 0));
	return data.value.pendidikan.map((item) => ({
		label: item.label,
		value: item.value,
		pct: max > 0 ? Math.round((item.value / max) * 100) : 0,
	}));
});

/* Hitung persentase dinamis untuk Pekerjaan */
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const pekerjaanList = computed(() => {
	if (!data.value.pekerjaan?.length) return [];
	const total = data.value.pekerjaan.reduce(
		(sum, item) => sum + (item.value || 0),
		0,
	);
	return data.value.pekerjaan.map((item) => ({
		label: item.label,
		value: item.value,
		icon: item.icon,
		pct: total > 0 ? Math.round((item.value / total) * 100) : 0,
	}));
});

function runCounter(el, target) {
	const obj = { val: 0 };
	anime({
		targets: obj,
		val: target,
		round: 1,
		duration: 1600,
		easing: "easeOutExpo",
		update() {
			el.textContent = Math.round(obj.val).toLocaleString("id-ID");
		},
	});
}

onMounted(async () => {
	try {
		const res = await fetch("/data/infografis/data.json");
		if (res.ok) data.value = await res.json();
	} catch (e) {
		console.error("Gagal memuat infografis:", e);
	} finally {
		loading.value = false;
	}

	setTimeout(() => {
		/**
		 * observeRepeat: Observer yang re-triggerable.
		 * resetFn dipanggil sebelum animateFn setiap kali section masuk viewport.
		 */
		const observeRepeat = (el, animateFn, resetFn, threshold = 0.15) => {
			if (!el) return;
			const obs = new IntersectionObserver(
				(entries) => {
					entries.forEach((e) => {
						if (!e.isIntersecting) return;
						resetFn(e.target);
						animateFn(e.target);
					});
				},
				{ threshold },
			);
			obs.observe(el);
		};

		// ── 1. Kependudukan: Counter + Pills slide dari kiri ──
		// Signature: number counter adalah yang PALING UNIK di seluruh website
		observeRepeat(
			secPenduduk.value,
			(sec) => {
				// Reset counter ke 0 dulu
				if (pendudukNumEl.value) pendudukNumEl.value.textContent = "0";
				if (pendudukNumEl.value && data.value.kependudukan)
					runCounter(pendudukNumEl.value, data.value.kependudukan.total || 0);
				anime({
					targets: sec.querySelectorAll(".pill"),
					opacity: [0, 1],
					translateX: [-24, 0],
					delay: anime.stagger(90),
					duration: 500,
					easing: "easeOutExpo",
				});
			},
			(sec) => {
				sec.querySelectorAll(".pill").forEach((el) => {
					el.style.opacity = "0";
					el.style.transform = "";
				});
			},
		);

		// Wilayah: 3D Flip dari bawah
		// Signature UNIK: rotateX: tidak dipakai di section mana pun
		observeRepeat(
			secWilayah.value,
			(sec) => {
				anime({
					targets: sec.querySelectorAll(".wtile"),
					opacity: [0, 1],
					rotateX: [90, 0],
					translateY: [30, 0],
					transformOrigin: ["50% 100%", "50% 100%"],
					delay: anime.stagger(70),
					duration: 600,
					easing: "easeOutBack",
				});
			},
			(sec) => {
				sec.querySelectorAll(".wtile").forEach((el) => {
					el.style.opacity = "0";
					el.style.transform = "";
				});
			},
		);

		// ── 3. Pendidikan: Bar grow dari kiri + label reveal ──
		// Signature UNIK: width animation pada bar-fill
		observeRepeat(
			secPendidikan.value,
			(sec) => {
				anime({
					targets: sec.querySelectorAll(".bar-row"),
					opacity: [0, 1],
					translateX: [-20, 0],
					delay: anime.stagger(65),
					duration: 450,
					easing: "easeOutExpo",
				});
				sec.querySelectorAll(".bar-fill").forEach((el) => {
					const targetW = el.getAttribute("data-width") || "0";
					anime({
						targets: el,
						width: ["0%", `${targetW}%`],
						duration: 950,
						delay: 200,
						easing: "easeOutExpo",
					});
				});
			},
			(sec) => {
				sec.querySelectorAll(".bar-row").forEach((el) => {
					el.style.opacity = "0";
					el.style.transform = "";
				});
				sec.querySelectorAll(".bar-fill").forEach((el) => {
					el.style.width = "0%";
				});
			},
		);

		// Pekerjaan: Scale pop + Ring draw
		// Signature: ring-arc stroke animation: digunakan hanya di sini
		observeRepeat(
			secPekerjaan.value,
			(sec) => {
				anime({
					targets: sec.querySelectorAll(".pcard"),
					opacity: [0, 1],
					scale: [0.88, 1],
					translateY: [16, 0],
					delay: anime.stagger(60),
					duration: 500,
					easing: "easeOutExpo",
				});
				sec.querySelectorAll(".ring-arc").forEach((el) => {
					const offset = parseFloat(el.getAttribute("data-offset") || "100");
					anime({
						targets: el,
						strokeDashoffset: [100, offset],
						duration: 1100,
						delay: 300,
						easing: "easeOutExpo",
					});
				});
			},
			(sec) => {
				sec.querySelectorAll(".pcard").forEach((el) => {
					el.style.opacity = "0";
					el.style.transform = "";
				});
				sec.querySelectorAll(".ring-arc").forEach((el) => {
					el.style.strokeDashoffset = "100";
				});
			},
		);

		// ── 5. Wisata Stats: Count-up + slide dari kanan ──
		// Signature UNIK: translateX dari kanan (berlawanan dari pills yang dari kiri)
		observeRepeat(
			secWisata.value,
			(sec) => {
				anime({
					targets: sec.querySelectorAll(".wstat"),
					opacity: [0, 1],
					translateX: [40, 0],
					delay: anime.stagger(80),
					duration: 550,
					easing: "easeOutExpo",
				});
				// Reset counter lalu jalankan ulang
				wstatEls.value.forEach(({ el, target }) => {
					if (el) {
						el.textContent = "0";
						runCounter(el, target || 0);
					}
				});
			},
			(sec) => {
				sec.querySelectorAll(".wstat").forEach((el) => {
					el.style.opacity = "0";
					el.style.transform = "";
				});
			},
		);

		// ── 6. Maps: Drop-in dari atas + scale ──
		// Signature UNIK: translateY negatif (dari atas) + scale
		observeRepeat(
			secMaps.value,
			(sec) => {
				anime({
					targets: sec.querySelector(".maps-wrapper"),
					opacity: [0, 1],
					translateY: [-30, 0],
					scale: [0.97, 1],
					duration: 700,
					easing: "easeOutExpo",
				});
			},
			(sec) => {
				const w = sec.querySelector(".maps-wrapper");
				if (w) {
					w.style.opacity = "0";
					w.style.transform = "";
				}
			},
		);
	}, 120);
});
</script>

<style scoped>
.info-page { background: var(--c-cream); min-height: 100vh; }

/* ─── Skeleton: mengikuti bentuk konten Infografis (unik, bukan spinner generik) ── */
.skel-section { padding: var(--sp-lg) var(--sp-md); }
.skel-section--dark { background: var(--c-stone); }
.skel-section--cream-dark { background: var(--c-cream-dark); }

.skel-penduduk { max-width: var(--max-w); margin: 0 auto; display: flex; gap: 3rem; flex-wrap: wrap; align-items: center; }
.skel-spotlight-num { width: 200px; height: 96px; border-radius: var(--radius-md); flex-shrink: 0; }
.skel-pills { display: flex; flex-direction: column; gap: 0.7rem; flex: 1; min-width: 220px; }
.skel-pill { height: 56px; border-radius: var(--radius-md); }

.skel-tiles { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
.skel-tile { height: 108px; border-radius: var(--radius-md); }

.skel-bars { max-width: var(--max-w); margin: 0 auto; display: flex; flex-direction: column; gap: 0.9rem; }
.skel-bar { height: 20px; border-radius: 99px; }

.skel-rings { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; }
.skel-ring { height: 148px; border-radius: var(--radius-md); }

@media (max-width: 600px) {
  .skel-penduduk { flex-direction: column; align-items: flex-start; }
  .skel-spotlight-num { width: 160px; height: 80px; }
}

/* Hero */
.page-hero { position:relative;overflow:hidden;background:var(--c-stone);padding:9rem var(--sp-md) 5rem; }
.page-hero__bg { position:absolute;inset:0;pointer-events:none; }
.hero-blob { position:absolute;border-radius:50%;filter:blur(60px);opacity:.22; }
.hero-blob--1 { width:420px;height:420px;background:var(--c-terra);top:-100px;right:-80px; }
.hero-blob--2 { width:300px;height:300px;background:var(--c-sage);bottom:-60px;left:10%; }
.hero-blob--3 { width:200px;height:200px;background:var(--c-terra-dark);top:50%;left:40%; }
.page-hero__content { position:relative;z-index:2;max-width:var(--max-w);margin:0 auto; }
.page-hero__label { display:inline-block;font-size:.68rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--c-terra);border:1px solid var(--c-terra);padding:.28rem .9rem;border-radius:50px;margin-bottom:1rem; }
.page-hero__title { font-family:var(--font-serif);font-size:clamp(2.2rem,6vw,4rem);font-weight:700;color:var(--c-cream);line-height:1.1;margin-bottom:.75rem; }
.page-hero__title em { font-style:italic;color:rgba(245,240,232,.6); }
.page-hero__year { font-size:.82rem;color:rgba(245,240,232,.4);letter-spacing:.1em; }

/* Sections */
.info-section { padding:var(--sp-lg) var(--sp-md); }
.info-section--dark { background:var(--c-stone); }
.info-section--cream-dark { background:var(--c-cream-dark); }
.info-section--terra { background:var(--c-terra-dark); }
.info-section--maps { background:var(--c-cream); }
.info-wrap { max-width:var(--max-w);margin:0 auto; }
.info-wrap--split { display:grid;grid-template-columns:1fr 1.6fr;gap:4rem;align-items:start; }
.sec-header { margin-bottom:2rem; }
.info-desc { color:var(--c-stone-muted);margin-top:.6rem;font-size:.95rem;line-height:1.6; }

/* Kependudukan */
.penduduk-layout { display:flex;gap:3rem;flex-wrap:wrap;align-items:center; }
.penduduk-spotlight { flex-shrink:0;text-align:center; }
.spotlight-num { display:block;font-family:var(--font-serif);font-size:clamp(4rem,10vw,7rem);font-weight:700;color:var(--c-terra);line-height:1; }
.spotlight-unit { font-family:var(--font-serif);font-size:1.5rem;color:var(--c-stone-muted); }
.spotlight-caption { font-size:.8rem;color:var(--c-stone-muted);margin-top:.4rem;max-width:160px; }
.penduduk-pills { display:flex;flex-direction:column;gap:.7rem;flex:1;min-width:220px; }
.pill { display:flex;align-items:center;gap:1rem;background:var(--c-white);border-radius:var(--radius-md);padding:.9rem 1.2rem;box-shadow:var(--shadow-card);opacity:0; border-left: 3px solid transparent; }
.pill--sage { border-left-color: var(--c-sage); }
.pill--terra { border-left-color: var(--c-terra); }
.pill--stone { border-left-color: var(--c-stone); }
.pill__val { display:block;font-family:var(--font-serif);font-size:1.4rem;font-weight:700;color:var(--c-stone); }
.pill__label { font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--c-stone-muted); }

/* Wilayah */
.wilayah-tiles { display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:1rem; }
.wtile { display:flex;flex-direction:column;align-items:center;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:var(--radius-md);padding:2rem 1rem;opacity:0; }
.wtile__icon { font-size:2rem;margin-bottom:.6rem; }
.wtile__num { font-family:var(--font-serif);font-size:2rem;font-weight:700;color:var(--c-cream); }
.wtile__label { font-size:.68rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.4);margin-top:.35rem; }

/* Bar chart */
.bar-chart { display:flex;flex-direction:column;gap:.9rem; }
.bar-row { display:flex;align-items:center;gap:.75rem;opacity:0; }
.bar-label { font-size:.8rem;color:var(--c-stone-muted);width:130px;flex-shrink:0;text-align:right; }
.bar-track { flex:1;background:var(--c-cream-dark);border-radius:99px;height:10px;overflow:hidden; }
.bar-fill { height:100%;border-radius:99px;width:0%; }
.bar-val { font-size:.78rem;font-weight:600;color:var(--c-stone-muted);width:45px;text-align:right; }

/* Pekerjaan */
.pekerjaan-grid { display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:1rem; }
.pcard { display:flex;flex-direction:column;align-items:center;text-align:center;background:var(--c-white);border-radius:var(--radius-md);padding:1.5rem 1rem;box-shadow:var(--shadow-card);opacity:0; }
.pcard__ring { position:relative;width:70px;height:70px;margin-bottom:.65rem; }
.pcard__ring svg { width:100%;height:100%; }
.ring-arc { transition:none; }
.pcard__pct { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:.88rem;font-weight:700;color:var(--c-stone); }
.pcard__icon { font-size:1.2rem;margin-bottom:.25rem; }
.pcard__val { font-family:var(--font-serif);font-size:1.1rem;font-weight:700;color:var(--c-stone); }
.pcard__label { font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--c-stone-muted);margin-top:.15rem; }

/* Wisata */
.wisata-row { display:flex;gap:2px;flex-wrap:wrap; }
.wstat { flex:1;min-width:150px;display:flex;flex-direction:column;align-items:center;text-align:center;padding:3rem 1.5rem;background:rgba(255,255,255,.05);border-right:1px solid rgba(255,255,255,.08); }
.wstat:last-child { border-right:none; }
.wstat__num { font-family:var(--font-serif);font-size:clamp(2.8rem,6vw,4.5rem);font-weight:700;color:var(--c-cream);line-height:1; }
.wstat__suffix { font-family:var(--font-serif);font-size:1.8rem;color:var(--c-terra); }
.wstat__label { font-size:.7rem;text-transform:uppercase;letter-spacing:.14em;color:rgba(245,240,232,.4);margin-top:.5rem; }

/* Maps */
.maps-wrapper { border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lift);opacity:0; }
.maps-iframe { width:100%;height:420px;border:0;display:block; }
.maps-actions { padding:1rem;background:var(--c-white);display:flex;justify-content:flex-end; }
.maps-btn { display:inline-flex;align-items:center;gap:.4rem;background:var(--c-terra);color:var(--c-white);padding:.55rem 1.2rem;border-radius:50px;font-size:.82rem;font-weight:500;text-decoration:none;transition:var(--transition); }
.maps-btn:hover { background:var(--c-terra-dark);transform:translateY(-1px); }

/* Responsive */
@media (max-width:900px) {
  .info-wrap--split { grid-template-columns:1fr;gap:2rem; }
}
@media (max-width:600px) {
  .wisata-row { flex-direction:column; }
  .wstat { border-right:none;border-bottom:1px solid rgba(255,255,255,.08); }
  .bar-label { width:90px;font-size:.74rem; }
  .penduduk-layout { flex-direction:column; }
  .maps-iframe { height:300px; }
}
</style>
