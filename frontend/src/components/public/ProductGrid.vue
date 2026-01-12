<template>
  <div class="product-grid">
    <div 
      v-for="product in products" 
      :key="product.id"
      class="product-card"
      @click="$emit('select', product)"
    >
      <img :src="product.image" :alt="product.name" class="product-image" />
      <div class="product-body">
        <span v-if="!product.isActive" class="product-badge badge-habis">Habis</span>
        <span v-else-if="product.badge" :class="['product-badge', getBadgeClass(product.badge)]">
          {{ product.badge }}
        </span>
        <h3 class="product-title">{{ product.name }}</h3>
        <p class="product-category">{{ product.category?.name }}</p>
        <div class="product-price" v-if="product.variants?.length">
          <span class="price-current">Rp {{ formatPrice(product.variants[0].price) }}</span>
          <span class="price-original">Rp {{ formatPrice(product.variants[0].originalPrice) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  products: {
    type: Array,
    required: true
  }
})

defineEmits(['select'])

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)

const getBadgeClass = (badge) => {
  if (badge === 'Terlaris') return 'badge-terlaris'
  if (badge === 'Instant') return 'badge-instant'
  return ''
}
</script>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  padding: 20px;
  background: #f9fafb;
}

.product-body {
  padding: 20px;
}

.product-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.badge-terlaris {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
}

.badge-instant {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.badge-habis {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.product-category {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 15px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-current {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3B82F6;
}

.price-original {
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
