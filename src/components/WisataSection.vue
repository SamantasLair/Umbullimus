<template>
  <section id="wisata" class="wisata-section wave-bottom" ref="sectionRef">
    <div class="wisata-container">
      <header class="wisata-header" ref="headerEl">
        <span class="section-label" ref="labelEl">Destinasi</span>
        <h2 class="section-title" ref="titleEl">
          Tempat <span class="text-highlight" ref="highlightEl">Wisata</span>
        </h2>
        <p class="wisata-desc" ref="descEl">
          Jelajahi keindahan alam dan kekayaan budaya yang menanti Anda di Umbul Limus.
        </p>
      </header>

      <!-- Skeleton loader: HCI perceived performance -->
      <div v-if="loading" class="wisata-grid wisata-skeleton" aria-hidden="true">
        <div v-for="n in 3" :key="n" class="skeleton-card">
          <div class="skeleton-box skeleton-img"></div>
          <div class="skeleton-body">
            <div class="skeleton-box skeleton-line w-60"></div>
            <div class="skeleton-box skeleton-line w-40"></div>
            <div class="skeleton-box skeleton-line w-80"></div>
          </div>
        </div>
      </div>

      <div v-else class="wisata-grid">
        <article
          v-for="(place, i) in places"
          :key="place.id"
          class="wisata-card"
          :ref="el => { if(el) cardEls[i] = el }"
          @mouseenter="onCardEnter($event, i)"
          @mouseleave="onCardLeave($event, i)"
        >
          <div class="card-image">
            <img
              :src="place.gambar"
              :alt="place.nama"
              loading="lazy"
              :ref="el => { if(el) imgEls[i] = el }"
            />
            <span
              class="card-kategori"
              :ref="el => { if(el) badgeEls[i] = el }"
            >{{ place.kategori }}</span>
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
import anime from "animejs";
import { nextTick, onMounted, ref } from "vue";
import { useScrollExit } from "../composables/useScrollExit.js";

const places = ref([]);
const loading = ref(true);

const sectionRef = ref(null);
const headerEl = ref(null);
const labelEl = ref(null);
const titleEl = ref(null);
const highlightEl = ref(null);
const descEl = ref(null);
const cardEls = ref([]);
const imgEls = ref([]);
const badgeEls = ref([]);

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const onCardEnter = (e, index) => {
	anime.remove([e.currentTarget, imgEls.value[index], badgeEls.value[index]]);
	anime({
		targets: e.currentTarget,
		translateY: -10,
		boxShadow: "0 24px 48px rgba(15,36,9,0.18)",
		duration: 600,
		easing: "easeOutExpo",
	});
	anime({
		targets: imgEls.value[index],
		scale: 1.07,
		duration: 800,
		easing: "easeOutExpo",
	});
	anime({
		targets: badgeEls.value[index],
		scale: 1.06,
		duration: 350,
		easing: "easeOutBack",
	});
};

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const onCardLeave = (e, index) => {
	anime.remove([e.currentTarget, imgEls.value[index], badgeEls.value[index]]);
	anime({
		targets: e.currentTarget,
		translateY: 0,
		boxShadow: "0 4px 24px rgba(15,36,9,0.09)",
		duration: 700,
		easing: "easeOutExpo",
	});
	anime({
		targets: imgEls.value[index],
		scale: 1,
		duration: 800,
		easing: "easeOutExpo",
	});
	anime({
		targets: badgeEls.value[index],
		scale: 1,
		duration: 400,
		easing: "easeOutExpo",
	});
};

let hasEntered = false;

// Reset semua elemen ke state awal sebelum animateIn ulang (opacity kartu tetap 1 jika sudah entered)
const resetElements = () => {
	[labelEl.value, titleEl.value, descEl.value].forEach((el) => {
		if (!el) return;
		el.style.opacity = "0";
		el.style.transform = "";
	});
	cardEls.value.forEach((el) => {
		if (!el) return;
		// Jika sudah pernah entered, jangan nol-kan opacity agar tidak hilang mendadak saat re-entry
		if (!hasEntered) el.style.opacity = "0";
		el.style.transform = "";
	});
	if (highlightEl.value)
		highlightEl.value.style.backgroundSize = "0% 100%";
};

// Rotasi & pivot unik per kartu — "Falling Leaves" signature
const CARD_PROPS = [
	{ rotateZ: -8, tx: -70, ty: 60, origin: 'bottom right' },
	{ rotateZ:  0, tx:   0, ty: 90, origin: 'top center'   },
	{ rotateZ:  8, tx:  70, ty: 60, origin: 'bottom left'  },
];

const animateIn = () => {
	const isFirst = !hasEntered;
	hasEntered = true;
	anime.remove([labelEl.value, titleEl.value, descEl.value, ...cardEls.value]);

	anime.timeline({ easing: 'easeOutExpo' })
		.add({
			targets:  labelEl.value,
			clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
			opacity:  [0, 1],
			duration: 600,
			easing:   'easeInOutQuart',
		})
		.add({
			targets:    titleEl.value,
			opacity:    [0, 1],
			translateY: [22, 0],
			duration:   700,
		}, '-=300')
		.add({
			targets:        highlightEl.value,
			backgroundSize: ['0% 100%', '100% 100%'],
			duration:       700,
			easing:         'easeOutQuart',
		}, '-=450')
		.add({
			targets:    descEl.value,
			opacity:    [0, 1],
			translateY: [12, 0],
			duration:   600,
		}, '-=400');

	// Tiap kartu punya rotasi & pivot sendiri — "Falling Leaves"
	cardEls.value.forEach((card, i) => {
		if (!card) return;
		const p = CARD_PROPS[i] ?? CARD_PROPS[0];
		card.style.transformOrigin = p.origin;
		card.style.opacity = "1";
		anime({
			targets:    card,
			opacity:    isFirst ? [0, 0.7, 1] : 1,
			translateX: [p.tx, p.tx * 0.08, 0],
			translateY: [p.ty, p.ty * 0.06, 0],
			rotateZ:    [p.rotateZ, p.rotateZ * 0.1, 0],
			delay:      230 + i * 200,
			duration:   isFirst ? 1000 : 750,
			easing:     'easeOutExpo',
		});
	});
};

// Scroll-linked SIGNATURE EXIT 1: "Postcard Fan-Out & Compact Radial Lift"
// Kartu melebar ke samping & mengecil secara mulus (100% opaque, tidak terpotong)
useScrollExit(
	sectionRef,
	() => [
		{ el: labelEl.value,    x: 0,    y: -60  },
		{ el: titleEl.value,    x: 0,    y: -80  },
		{ el: descEl.value,     x: 0,    y: -50  },
		{ el: cardEls.value[0], x: -120, y: -140, rotate: -16, rotateY: 18,  skewY: -8, scale: 0.92 },
		{ el: cardEls.value[1], x: 0,    y: -180, rotate: 0,   rotateX: 24,  skewX: 0,  scale: 0.90 },
		{ el: cardEls.value[2], x: 120,  y: -140, rotate: 16,  rotateY: -18, skewY: 8,  scale: 0.92 },
	],
	{ exitZone: 320, staggerPx: 20 },
);

onMounted(async () => {
	try {
		const res = await fetch("/data/tempat-wisata/list.json");
		if (res.ok) places.value = await res.json();
	} catch (e) {
		console.error("Gagal memuat data wisata:", e);
	} finally {
		loading.value = false;
	}

	await nextTick();

	// Hide initially
	[labelEl.value, titleEl.value, descEl.value].forEach((el) => {
		if (el) {
			el.style.opacity = "0";
		}
	});

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
		{ threshold: 0.18 },
	);

	if (headerEl.value) observer.observe(headerEl.value);
});
</script>

<style scoped>
.wisata-section {
  position: relative;
  background: var(--c-cream);
  padding: var(--sp-xl) var(--sp-md) calc(var(--sp-xl) + 40px);
  overflow: visible;
  z-index: 1;
}

.wisata-container { max-width: var(--max-w); margin: 0 auto; position: relative; z-index: 1; }

.wisata-header { max-width: 560px; margin-bottom: 3.5rem; }

.text-highlight {
  background: linear-gradient(120deg, rgba(212, 168, 83, 0.38) 0%, rgba(212, 168, 83, 0.38) 100%);
  background-repeat: no-repeat;
  background-size: 0% 100%;
  padding: 0 0.1em;
  border-radius: 3px;
  display: inline-block;
}

.wisata-desc { color: var(--c-stone-muted); margin-top: 0.75rem; font-size: 1rem; }

/* Skeleton */
.wisata-skeleton { pointer-events: none; }

.skeleton-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.skeleton-img  { height: 220px; border-radius: 0; }
.skeleton-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.skeleton-line { height: 14px; }
.w-40 { width: 40%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }

/* Grid */
.wisata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Cards */
.wisata-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  opacity: 0;
  will-change: transform, box-shadow;
}

.card-image { position: relative; height: 220px; overflow: hidden; }
.card-image img {
  width: 100%; height: 100%;
  object-fit: cover;
  will-change: transform;
  transition: filter 0.6s ease;
}
.wisata-card:hover .card-image img { filter: brightness(1.04); }

.card-kategori {
  position: absolute;
  top: 1rem; left: 1rem;
  background: var(--c-terra-dark);
  color: var(--c-white);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  will-change: transform;
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

.card-fasilitas { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.card-fasilitas li {
  background: var(--c-cream);
  color: var(--c-terra-dark);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  border: 1px solid var(--c-cream-dark);
}

@media (max-width: 600px) {
  .wisata-section { padding: var(--sp-lg) 1.25rem calc(var(--sp-lg) + 40px); }
}
</style>
