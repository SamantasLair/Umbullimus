/**
 * useCardHover: satu bahasa hover yang sama untuk SEMUA kartu di seluruh situs.
 * Playful & interactive (bukan transisi CSS datar): pop elastis saat masuk,
 * kembali mulus saat keluar. Dipakai di banyak halaman/section agar terasa "menyatu".
 */
import anime from 'animejs'

export function useCardHover({ lift = -8, scale = 1.02 } = {}) {
	function onEnter(e) {
		const target = e.currentTarget
		anime.remove(target)
		anime({
			targets: target,
			translateY: lift,
			scale,
			duration: 500,
			easing: 'easeOutElastic(1, .6)',
		})
	}

	function onLeave(e) {
		const target = e.currentTarget
		anime.remove(target)
		anime({
			targets: target,
			translateY: 0,
			scale: 1,
			duration: 400,
			easing: 'easeOutExpo',
		})
	}

	return { onEnter, onLeave }
}
