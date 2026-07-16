<script setup>
import { useRouter } from 'vue-router'
import HeaderNav from './components/HeaderNav.vue'
import FooterContact from './components/FooterContact.vue'
</script>

<template>
  <HeaderNav />
  <RouterView />
  <FooterContact />
</template>
