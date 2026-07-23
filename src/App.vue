<script setup>
import { onMounted, onUnmounted, ref } from "vue";
// biome-ignore lint/correctness/noUnusedImports: Used in Vue template
import FooterContact from "./components/FooterContact.vue";
// biome-ignore lint/correctness/noUnusedImports: Used in Vue template
import HeaderNav from "./components/HeaderNav.vue";

const progressEl = ref(null);

const onScroll = () => {
	const scrolled = window.scrollY;
	const max = document.documentElement.scrollHeight - window.innerHeight;
	if (progressEl.value)
		progressEl.value.style.width = `${(scrolled / max) * 100}%`;
};

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <div id="scroll-progress" ref="progressEl" aria-hidden="true"></div>
  <HeaderNav />
  <RouterView />
  <FooterContact />
</template>
