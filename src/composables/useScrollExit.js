/**
 * useScrollExit: Clean Scroll-Linked Exit Animation
 *
 * Elemen bergerak keluar secara halus mengikuti scroll.
 * Hanya translateX/Y, scale, dan rotateZ (flat): NO 3D transforms.
 * Opacity tidak dimodifikasi (tetap 1).
 *
 * Formula:
 *   easeP = sin(rawP * PI / 2)   ← smooth ease-out progression
 *   curY  = y * easeP²           ← quadratic acceleration upward
 *
 * Nonaktif di layar sempit (<=768px): offset per-index diasumsikan untuk 1 baris
 * (layout desktop). Begitu grid wrap jadi beberapa baris di mobile, tiap item
 * beda jauh posisinya tapi tetap diberi offset yang sama → animasi tidak
 * sinkron dan terlihat tabrakan/terputus. Daripada menambal per halaman,
 * dimatikan terpusat di sini untuk semua pemakai composable ini.
 */
import { onMounted, onUnmounted } from "vue";

const MOBILE_BREAKPOINT = "(max-width: 768px)";

export function useScrollExit(sectionRef, getItems, opts = {}) {
	const { exitZone = 320, staggerPx = 18 } = opts;
	let ticking = false;
	const mq =
		typeof window !== "undefined" && window.matchMedia
			? window.matchMedia(MOBILE_BREAKPOINT)
			: null;

	const applyTransform = (el, item, rawP) => {
		const {
			x = 0,
			y = -100,
			scale = 1,
			rotate = 0,
		} = item;

		// Smooth sinusoidal ease-out (0 → 1)
		const easeP = Math.sin((rawP * Math.PI) / 2);

		const parts = [];

		// Translation: quadratic acceleration upward feels natural
		const curX = x * easeP;
		const curY = y * (easeP * easeP);
		if (curX !== 0 || curY !== 0) {
			parts.push(`translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`);
		}

		// Gentle flat rotation only (no 3D tilt)
		const curRotZ = rotate * easeP;
		if (Math.abs(curRotZ) > 0.01) {
			parts.push(`rotateZ(${curRotZ.toFixed(2)}deg)`);
		}

		// Scale down slightly
		const curScale = 1 - (1 - scale) * easeP;
		if (Math.abs(curScale - 1) > 0.001) {
			parts.push(`scale(${curScale.toFixed(3)})`);
		}

		el.style.transform = parts.length ? parts.join(" ") : "";
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

			// Di mobile: pastikan semua item selalu dalam posisi natural (tanpa transform)
			if (mq?.matches) {
				items.forEach((item) => clearTransform(item.el));
				return;
			}
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

