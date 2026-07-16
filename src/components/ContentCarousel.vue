<template>
  <section id="gallery" class="carousel-section">
    <div class="carousel-container reveal-up" ref="carouselEl">
      <h2 class="section-title">Discover More</h2>
      
      <div class="carousel-track-wrapper">
        <div class="carousel-track">
          <!-- Dynamic Items from CMS JSON -->
          <div v-for="(item, index) in galleryItems" :key="index" class="carousel-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.title" />
            </div>
            <div class="item-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const carouselEl = ref(null);
const galleryItems = ref([]);

onMounted(async () => {
  try {
    const res = await fetch('/data/gallery.json');
    if (res.ok) {
      const data = await res.json();
      galleryItems.value = data.items || [];
    }
  } catch (error) {
    console.error("Failed to load gallery JSON:", error);
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  if (carouselEl.value) {
    observer.observe(carouselEl.value);
  }
});
</script>

<style scoped>
.carousel-section {
  background-color: var(--c-emerald);
  /* Optional: placeholder for leaf texture background */
  background-image: radial-gradient(circle at 10% 20%, rgba(26, 64, 45, 0.8) 0%, var(--c-emerald) 90%);
  padding: 4rem 2rem 6rem 2rem;
  color: var(--c-white);
}

.carousel-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  color: var(--c-gold);
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.carousel-track-wrapper {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}

.carousel-track-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.carousel-track {
  display: flex;
  gap: 2rem;
  padding-bottom: 2rem;
}

.carousel-item {
  flex: 0 0 300px;
  scroll-snap-align: start;
  background: var(--c-forest);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
}

.carousel-item:hover {
  transform: translateY(-5px);
}

.item-image {
  width: 100%;
  height: 200px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  padding: 1.5rem;
}

.item-content h3 {
  font-family: var(--font-sans);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--c-gold);
}

.item-content p {
  font-size: 0.9rem;
  color: #ccc;
}
</style>
