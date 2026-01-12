<template>
  <section class="flash-sale-section" v-if="flashSales.length > 0">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">⚡ Flash Sale</h2>
      </div>
      <div class="flash-sale-grid">
        <div 
          v-for="fs in flashSales" 
          :key="fs.id"
          class="flash-sale-card"
          @click="$emit('select', fs)"
        >
          <div class="flash-badge">🔥 {{ fs.discountPercent }}% OFF</div>
          <img :src="fs.productImage" :alt="fs.productName" class="flash-image" />
          <div class="flash-content">
            <h3>{{ fs.productName }}</h3>
            <p class="flash-title">{{ fs.title }}</p>
            <div class="flash-prices">
              <span class="flash-original">Rp {{ formatPrice(fs.originalPrice) }}</span>
              <span class="flash-discounted">Rp {{ formatPrice(fs.discountedPrice) }}</span>
            </div>
            <div class="flash-timer">
              ⏰ Berakhir: {{ formatDate(fs.endDate) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  flashSales: {
    type: Array,
    required: true
  }
})

defineEmits(['select'])

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.flash-sale-section {
  padding: 60px 0;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
}

.flash-sale-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.flash-sale-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
}

.flash-sale-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.flash-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  z-index: 1;
}

.flash-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  padding: 20px;
  background: #f9fafb;
}

.flash-content {
  padding: 20px;
}

.flash-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.flash-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 15px;
}

.flash-prices {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.flash-original {
  font-size: 0.9rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.flash-discounted {
  font-size: 1.25rem;
  font-weight: 700;
  color: #dc2626;
}

.flash-timer {
  font-size: 0.8rem;
  color: #d97706;
  font-weight: 500;
}

@media (max-width: 768px) {
  .flash-sale-grid {
    grid-template-columns: 1fr;
  }
}
</style>
