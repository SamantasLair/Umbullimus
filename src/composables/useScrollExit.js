/**
 * useScrollExit — Playful Physical Scroll-Linked Exit (STRICTLY NO OPACITY MODIFICATION)
 *
 * Elemen bergerak KELUAR secara fisik mengikuti kecepatan scroll dengan fisika
 * miring/membal (playful spring arc, 3D tilt, skew).
 * Tidak ada opacity (100% opaque, opacity = 1). 100% terikat ke posisi scroll.
 *
 * Formula:
 *   rawP  = clamp((-rect.top - i * staggerPx) / exitZone, 0, 1)
 *   easeP = sin(rawP * PI / 2)
 *   arcP  = sin(rawP * PI)  <-- peaks in middle for spring bounce/skew
 *
 * Ref: Val Head "Designing with Motion" (2016) — Spatial Continuity & Playful Physics
 * Ref: web.dev/articles/scroll-driven-animations
 *
 * @param {import('vue').Ref<HTMLElement|null>} sectionRef
 * @param {() => Array<{el:HTMLElement, x?:number, y?:number, scale?:number, scaleBounce?:number, rotate?:number, rotateX?:number, rotateY?:number, skewX?:number, skewY?:number}>} getItems
 * @param {{ exitZone?:number, staggerPx?:number }} opts
 */
import { onMounted, onUnmounted } from "vue";

export function useScrollExit(sectionRef, getItems, opts = {}) {
	const { exitZone = 450, staggerPx = 25 } = opts;

	let ticking = false;

	const applyTransform = (el, item, rawP) => {
		const {
			x = 0,
			y = -140,
			scale = 1,
			scaleBounce = 0,
			rotate = 0,
			rotateX = 0,
			rotateY = 0,
			skewX = 0,
			skewY = 0,
		} = item;

		// Smooth sinusoidal progression (0 to 1)
		const easeP = Math.sin((rawP * Math.PI) / 2);
		// Arc progression (peaks at middle of exit zone for dynamic spring wobble)
		const arcP = Math.sin(rawP * Math.PI);

		const parts = [];

		if (rotateX !== 0 || rotateY !== 0) {
			parts.push("perspective(800px)");
		}

		// Translation (smooth quadratic acceleration upward)
		const curX = x * easeP;
		const curY = y * (easeP * easeP);
		if (curX !== 0 || curY !== 0) {
			parts.push(`translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`);
		}

		// 3D Rotations
		if (rotateX !== 0) {
			parts.push(`rotateX(${(rotateX * easeP).toFixed(2)}deg)`);
		}
		if (rotateY !== 0) {
			parts.push(`rotateY(${(rotateY * easeP).toFixed(2)}deg)`);
		}

		// Playful spring arc rotation
		const curRotZ = rotate * easeP + rotate * 0.35 * arcP;
		if (curRotZ !== 0) {
			parts.push(`rotateZ(${curRotZ.toFixed(2)}deg)`);
		}

		// Elastic Skew
		const curSkewX = skewX * arcP + skewX * 0.4 * easeP;
		const curSkewY = skewY * arcP + skewY * 0.4 * easeP;
		if (curSkewX !== 0 || curSkewY !== 0) {
			parts.push(`skew(${curSkewX.toFixed(2)}deg, ${curSkewY.toFixed(2)}deg)`);
		}

		// Dynamic scale bounce
		const curScale = (1 - (1 - scale) * easeP) + scaleBounce * arcP;
		if (curScale !== 1) {
			parts.push(`scale(${curScale.toFixed(3)})`);
		}

		el.style.transform = parts.join(" ");
		el.style.willChange = "transform";
	};

	const clearTransform = (el) => {
		if (!el) return;
		el.style.transform = "";
		el.style.willChange = "";
		el.dataset.se = "0";
	};

	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			ticking = false;
			if (!sectionRef.value) return;

			const items = getItems().filter((it) => it?.el);
			const viewportHeight = window.innerHeight || 800;
			// Threshold: Animasi exit HANYA mulai saat elemen masuk ke 35% area atas viewport (saat keluar layar ke atas)
			const exitThreshold = viewportHeight * 0.35;

			items.forEach((item, i) => {
				const { el } = item;
				if (!el) return;

				const elRect = el.getBoundingClientRect();
				const scrolled = exitThreshold - elRect.top - i * staggerPx;
				const rawP = Math.max(0, Math.min(1, scrolled / exitZone));

				el.dataset.se = rawP > 0 ? "1" : "0";
				if (rawP > 0) {
					applyTransform(el, item, rawP);
				} else {
					clearTransform(el);
				}
			});
		});
	};

	onMounted(() =>
		window.addEventListener("scroll", onScroll, { passive: true }),
	);
	onUnmounted(() => window.removeEventListener("scroll", onScroll));
}

