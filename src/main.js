import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import HomePage from './pages/HomePage.vue'
import BaganPage from './pages/BaganPage.vue'
import InfografisPage from './pages/InfografisPage.vue'
import GaleriPage from './pages/GaleriPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',           component: HomePage },
    { path: '/bagan',      component: BaganPage },
    { path: '/infografis', component: InfografisPage },
    { path: '/galeri',     component: GaleriPage },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

// Pengalihan otomatis jika rute /admin diakses melalui Vue Router
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/admin')) {
    window.location.href = '/admin/index.html'
    return
  }
  next()
})

createApp(App).use(router).mount('#app')
