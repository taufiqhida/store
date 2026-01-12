<template>
  <section class="hero" v-if="show">
    <div class="hero-content">
      <h1 class="hero-logo">{{ storeName }}</h1>
      <p class="hero-tagline">{{ tagline }}</p>
      <button class="hero-btn" @click="$emit('enter')">
        🛒 Lihat Produk
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  show: Boolean,
  storeName: String,
  tagline: String
})

defineEmits(['enter'])
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
  margin-bottom: 40px;
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
