<template>
  <section id="galeri" class="gallery-section wave-bottom-dark" ref="sectionRef">
    <div class="gallery-container">
      <header class="gallery-header" ref="headerEl">
        <span class="section-label on-dark" ref="labelEl">Galeri</span>
        <h2 class="section-title on-dark" ref="titleEl">
          Keindahan <span class="text-highlight-dark" ref="highlightEl">Umbul Limus</span>
        </h2>
      </header>

      <div v-if="loading" class="bento-grid bento-skeleton" aria-hidden="true">
        <div
          v-for="(cls, n) in ['bento-wide','bento-tall','bento-square','bento-square','bento-wide','bento-tall']"
          :key="n"
          class="skeleton-box"
          :class="cls"
        ></div>
      </div>

      <div v-else class="bento-grid">
        <figure
          v-for="(item, i) in items"
          :key="item.id"
          class="bento-item"
          :class="bentoClass(i)"
          :ref="el => { if(el) bentoEls[i] = el }"
          @mouseenter="onBentoEnter($event, i)"
          @mouseleave="onBentoLeave($event, i)"
        >
          <img :src="item.gambar" :alt="item.judul" loading="lazy" />
          <figcaption :ref="el => { if(el) captionEls[i] = el }">
            <span class="bento-title">{{ item.judul }}</span>
            <span class="bento-desc">{{ item.deskripsi }}</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup>
import anime from "animejs";
import { nextTick, onMounted, ref } from "vue";
import { useScrollExit } from "../composables/useScrollExit.js";

const items = ref([]);
const loading = ref(true);

const sectionRef = ref(null);
const headerEl = ref(null);
const labelEl = ref(null);
const titleEl = ref(null);
const highlightEl = ref(null);
const bentoEls = ref([]);
const captionEls = ref([]);

// Dwell reward: image saturation enhances after 2.5s hover: discovered naturally
const dwellTimers = {};

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const bentoClass = (i) => {
	const pattern = ["wide", "tall", "square", "square", "wide", "tall"];
	return `bento-${pattern[i % pattern.length] || "square"}`;
};

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const onBentoEnter = (e, index) => {
	const img = e.currentTarget.querySelector("img");
	anime.remove([img, captionEls.value[index]]);
	// Entry: scale + caption slide: signature animation (berbeda dari wisata)
	anime({ targets: img, scale: 1.07, duration: 900, easing: "easeOutExpo" });
	anime({
		targets: captionEls.value[index],
		opacity: 1,
		translateY: [12, 0],
		duration: 380,
		easing: "easeOutQuart",
	});

	// Hidden reward: after 2.5s hover, image subtly "comes alive" with saturation
	dwellTimers[index] = setTimeout(() => {
		if (img) {
			anime({
				targets: img,
				filter: ["saturate(1) brightness(1)", "saturate(1.3) brightness(1.06)"],
				duration: 1200,
				easing: "easeOutQuart",
			});
		}
	}, 2500);
};

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const onBentoLeave = (e, index) => {
	clearTimeout(dwellTimers[index]);
	const img = e.currentTarget.querySelector("img");
	anime.remove([img, captionEls.value[index]]);
	anime({
		targets: img,
		scale: 1,
		filter: "saturate(1) brightness(1)",
		duration: 800,
		easing: "easeOutExpo",
	});
	anime({
		targets: captionEls.value[index],
		opacity: 0,
		translateY: 10,
		duration: 350,
		easing: "easeInQuart",
	});
};

let hasEntered = false;

const resetElements = () => {
	[labelEl.value, titleEl.value].forEach((el) => {
		if (!el) return;
		el.style.opacity = "0";
		el.style.transform = "";
	});
	bentoEls.value.forEach((el) => {
		if (!el) return;
		// Jika sudah pernah entered, jangan nol-kan opacity agar tidak hilang mendadak saat re-entry
		if (!hasEntered) el.style.opacity = "0";
		el.style.transform = "";
	});
	if (highlightEl.value)
		highlightEl.value.style.backgroundSize = "0% 100%";
};

const animateIn = () => {
	const isFirst = !hasEntered;
	const dur = isFirst ? 900 : 700;
	hasEntered = true;
	anime.remove([labelEl.value, titleEl.value, ...bentoEls.value]);

	bentoEls.value.forEach((el) => {
		if (el) el.style.opacity = "1";
	});

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
			translateY: [18, 0],
			duration:   700,
		}, '-=300')
		.add({
			targets:        highlightEl.value,
			backgroundSize: ['0% 100%', '100% 100%'],
			duration:       700,
			easing:         'easeOutQuart',
		}, '-=450')
		// Bento: "Stones Surfacing": grid ripple dari tengah ke tepi
		.add({
			targets:  bentoEls.value,
			opacity:  isFirst ? [0, 1] : 1,
			scale:    [0.88, 1.03, 1],
			rotateZ:  (_, i) => [i % 2 === 0 ? -2 : 2, 0],
			delay:    anime.stagger(85, { grid: [3, 2], from: 'center' }),
			duration: dur,
			easing:   'easeOutBack',
		}, '-=200');
};

// Scroll-linked SIGNATURE EXIT 2: "Bento Mosaic Upward Lift & Floating Compact Fold"
// Kartu terangkat KE ATAS & mengecil secara mulus saat melewati 35% area atas viewport
useScrollExit(
	sectionRef,
	() => [
		{ el: labelEl.value,     y: -50 },
		{ el: titleEl.value,     y: -70 },
		{ el: bentoEls.value[0], x: -40, y: -100, scale: 0.93 },
		{ el: bentoEls.value[1], x:  40, y: -110, scale: 0.93 },
		{ el: bentoEls.value[2], x: -20, y: -120, scale: 0.91 },
		{ el: bentoEls.value[3], x:  20, y: -100, scale: 0.91 },
		{ el: bentoEls.value[4], x:   0, y: -130, scale: 0.91 },
		{ el: bentoEls.value[5], x: -30, y: -100, scale: 0.93 },
	],
	{ exitZone: 280, staggerPx: 12 },
);

onMounted(async () => {
	try {
		const res = await fetch("/data/gallery/list.json");
		if (res.ok) items.value = await res.json();
	} catch (e) {
		console.error("Gagal memuat galeri:", e);
	} finally {
		loading.value = false;
	}

	await nextTick();

	[labelEl.value, titleEl.value].forEach((el) => {
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
					// TIDAK unobserve: animasi harus bisa berulang
				}
			});
		},
		{ threshold: 0.15 },
	);

	if (headerEl.value) observer.observe(headerEl.value);
});
</script>

<style scoped>
.gallery-section {
  position: relative;
  background: var(--c-gallery-bg);
  padding: calc(var(--sp-xl) + 30px) var(--sp-md) calc(var(--sp-xl) + 50px);
  overflow: visible;
  z-index: 2;
}

.gallery-container { max-width: var(--max-w); margin: 0 auto; position: relative; z-index: 1; }

.gallery-header { margin-bottom: 2.5rem; }

.text-highlight-dark {
  background: linear-gradient(120deg, rgba(212, 168, 83, 0.45) 0%, rgba(212, 168, 83, 0.45) 100%);
  background-repeat: no-repeat;
  background-size: 0% 100%;
  padding: 0 0.1em;
  border-radius: 3px;
  display: inline-block;
}

/* Bento skeleton uses class from global style.css */
.bento-skeleton { pointer-events: none; opacity: 0.5; }
.bento-skeleton .skeleton-box { min-height: 220px; }

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
  will-change: transform, filter;
}

.bento-item img {
  width: 100%; height: 100%;
  object-fit: cover;
  will-change: transform, filter;
}

.bento-item figcaption {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(7, 31, 4, 0.88) 0%, transparent 55%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.25rem;
  opacity: 0;
  transform: translateY(10px);
  will-change: transform, opacity;
}

.bento-title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--c-white);
  font-weight: 600;
}

.bento-desc {
  font-size: 0.78rem;
  color: rgba(237, 248, 233, 0.72);
  margin-top: 0.25rem;
}

.bento-wide   { grid-column: span 2; }
.bento-tall   { grid-row: span 2; }
.bento-square { grid-column: span 1; }

@media (max-width: 768px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 180px; }
  .bento-wide { grid-column: span 2; }
  .bento-tall { grid-row: span 1; }
}
@media (max-width: 480px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-wide, .bento-tall { grid-column: span 1; grid-row: span 1; }
}
@media (max-width: 600px) {
  .gallery-section { padding: var(--sp-lg) 1.25rem calc(var(--sp-lg) + 50px); }
}
</style>
