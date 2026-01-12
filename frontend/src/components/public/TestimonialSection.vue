<template>
  <section class="testimonial-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">💬 Testimoni Pelanggan</h2>
        <button class="testimonial-btn" @click="$emit('write')">
          ✍️ Tulis Testimoni
        </button>
      </div>
      
      <div v-if="testimonials.length > 0" class="testimonial-grid">
        <div v-for="testi in testimonials" :key="testi.id" class="testimonial-card">
          <div class="testimonial-header">
            <div class="testimonial-avatar">{{ testi.name.charAt(0).toUpperCase() }}</div>
            <div class="testimonial-info">
              <h4 class="testimonial-name">{{ testi.name }}</h4>
              <p class="testimonial-product">{{ testi.productName }}</p>
            </div>
          </div>
          <div class="testimonial-rating">
            <span v-for="s in 5" :key="s">{{ s <= testi.rating ? '⭐' : '☆' }}</span>
          </div>
          <p class="testimonial-content">{{ testi.content }}</p>
        </div>
      </div>
      
      <div v-else class="testimonial-empty">
        <p>📝 Belum ada testimoni. Jadilah yang pertama!</p>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  testimonials: {
    type: Array,
    required: true
  }
})

defineEmits(['write'])
</script>

<style scoped>
.testimonial-section {
  padding: 60px 0;
  background: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
}

.testimonial-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.testimonial-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.testimonial-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.testimonial-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.testimonial-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
}

.testimonial-name {
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.testimonial-product {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.testimonial-rating {
  margin-bottom: 12px;
  font-size: 1rem;
}

.testimonial-content {
  color: #4b5563;
  line-height: 1.6;
  font-size: 0.9rem;
}

.testimonial-empty {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .testimonial-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .testimonial-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
