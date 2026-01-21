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
        
        <!-- Product Rating (per product) -->
        <div class="product-rating" v-if="getProductReviewCount(product.name) > 0">
          <span class="rating-stars">
            <span v-for="star in 5" :key="star" :class="['star', { filled: star <= Math.round(getProductRating(product.name)) }]">
              {{ star <= Math.round(getProductRating(product.name)) ? '★' : '☆' }}
            </span>
          </span>
          <span class="rating-text">{{ getProductRating(product.name).toFixed(1) }} ({{ getProductReviewCount(product.name) }})</span>
        </div>
        
        <div class="product-price" v-if="product.variants?.length">
          <span class="price-current">Rp {{ formatPrice(product.variants[0].price) }}</span>
          <span class="price-original">Rp {{ formatPrice(product.variants[0].originalPrice) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  testimonials: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select'])

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)

const getBadgeClass = (badge) => {
  if (badge === 'Terlaris') return 'badge-terlaris'
  if (badge === 'Instant') return 'badge-instant'
  return ''
}

// Get reviews for a specific product
const getProductReviews = (productName) => {
  if (!props.testimonials || !productName) return []
  return props.testimonials.filter(t => t.productName === productName)
}

// Get review count for a specific product
const getProductReviewCount = (productName) => {
  return getProductReviews(productName).length
}

// Get average rating for a specific product
const getProductRating = (productName) => {
  const reviews = getProductReviews(productName)
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, t) => acc + (t.rating || 5), 0)
  return sum / reviews.length
}
</script>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  padding: 20px;
  background: var(--bg-secondary);
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
  color: var(--text);
}

.product-category {
  font-size: 0.875rem;
  color: var(--text-secondary);
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
  color: var(--accent);
}

.price-original {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

/* Product Rating Styles */
.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .star {
  font-size: 0.9rem;
  color: #d1d5db;
}

.rating-stars .star.filled {
  color: #fbbf24;
}

.rating-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
