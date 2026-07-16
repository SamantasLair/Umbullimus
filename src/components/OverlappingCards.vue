<template>
  <section class="overlapping-section">
    <div class="cards-container">
      <div 
        v-for="(card, index) in cards" 
        :key="index"
        class="polaroid-card reveal-up"
        ref="cardElements"
      >
        <div class="card-image-wrapper">
          <img :src="card.image" :alt="card.alt" class="card-img" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const cards = [
  { image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=600&auto=format&fit=crop', alt: 'Jungle Path' },
  { image: 'https://images.unsplash.com/photo-1506161474968-3e4299b820a2?q=80&w=600&auto=format&fit=crop', alt: 'Waterfall Pool' },
  { image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=600&auto=format&fit=crop', alt: 'Cultural Ceremony' },
  { image: 'https://images.unsplash.com/photo-1552089123-2d26224fda81?q=80&w=600&auto=format&fit=crop', alt: 'Heritage Statue' }
];

const cardElements = ref([]);

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optional: unobserve after animating once
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  cardElements.value.forEach(el => {
    if (el) observer.observe(el);
  });
});
</script>

<style scoped>
.overlapping-section {
  position: relative;
  z-index: 10;
  margin-top: -15vh; /* Pulls the section up to overlap the video */
  padding: 0 2rem;
  /* Dark green background to seamlessly blend into the carousel below */
  background: linear-gradient(to bottom, transparent 0%, var(--c-emerald) 50%, var(--c-emerald) 100%);
}

.cards-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.polaroid-card {
  background: var(--c-white);
  padding: 10px 10px 30px 10px;
  box-shadow: var(--shadow-float);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer;
}

.polaroid-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0,0,0,0.5);
  z-index: 2;
}

.card-image-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.polaroid-card:hover .card-img {
  transform: scale(1.1);
}

/* Staggered animation delays for the scroll reveal */
.polaroid-card:nth-child(1) { transition-delay: 0.1s; }
.polaroid-card:nth-child(2) { transition-delay: 0.2s; }
.polaroid-card:nth-child(3) { transition-delay: 0.3s; }
.polaroid-card:nth-child(4) { transition-delay: 0.4s; }

/* Responsive adjustments */
@media (max-width: 1024px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 600px) {
  .cards-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .overlapping-section {
    margin-top: -10vh;
  }
}
</style>
