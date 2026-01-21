<template>
  <section class="hero" v-if="show">
    <div class="hero-content">
      <h1 class="hero-logo">{{ storeName }}</h1>
      <p class="hero-tagline">{{ tagline }}</p>
      
      <!-- Customer Rating Display -->
      <div v-if="totalReviews > 0" class="hero-rating">
        <div class="rating-stars">
          <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= Math.round(averageRating) }">
            {{ star <= Math.round(averageRating) ? '★' : '☆' }}
          </span>
        </div>
        <div class="rating-info">
          <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
          <span class="rating-separator">/</span>
          <span class="rating-max">5</span>
          <span class="rating-divider">•</span>
          <span class="rating-count">{{ totalReviews }} ulasan</span>
        </div>
      </div>
      
      <button class="hero-btn" @click="$emit('enter')">
        🛒 Lihat Produk
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  storeName: String,
  tagline: String,
  testimonials: {
    type: Array,
    default: () => []
  }
})

defineEmits(['enter'])

// Calculate average rating from testimonials
const totalReviews = computed(() => props.testimonials?.length || 0)

const averageRating = computed(() => {
  if (!props.testimonials || props.testimonials.length === 0) return 0
  const sum = props.testimonials.reduce((acc, t) => acc + (t.rating || 5), 0)
  return sum / props.testimonials.length
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 40px;
}

.hero-logo {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-tagline {
  font-size: 1.5rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

/* Hero Rating Styles */
.hero-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
  animation: fadeInUp 0.6s ease 0.3s backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.rating-stars .star {
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.3);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.rating-stars .star.filled {
  color: #fbbf24;
  text-shadow: 0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(251, 191, 36, 0.3);
  animation: starPulse 2s ease-in-out infinite;
}

@keyframes starPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.rating-value {
  font-weight: 700;
  font-size: 1.2rem;
  color: #fbbf24;
}

.rating-separator,
.rating-max {
  color: rgba(255, 255, 255, 0.5);
}

.rating-divider {
  color: rgba(255, 255, 255, 0.3);
  margin: 0 4px;
}

.rating-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #3B82F6;
  color: white;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
  border: none;
  cursor: pointer;
}

.hero-btn:hover {
  background: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 15px 50px rgba(59, 130, 246, 0.5);
}

@media (max-width: 768px) {
  .hero-logo {
    font-size: 2.5rem;
  }

  .hero-tagline {
    font-size: 1.2rem;
  }
}
</style>
