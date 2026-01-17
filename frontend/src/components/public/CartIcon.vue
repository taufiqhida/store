<template>
  <button class="cart-icon-btn" @click="toggleCart" title="Keranjang">
    <span class="cart-icon">🛒</span>
    <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
  </button>
</template>

<script setup>
import { useCart } from '../../composables/useCart'

const { cartCount, toggleCart } = useCart()
</script>

<style scoped>
.cart-icon-btn {
  position: relative;
  background: var(--bg-secondary, #f3f4f6);
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-icon-btn:hover {
  background: var(--accent, #3b82f6);
  transform: scale(1.05);
}

.cart-icon-btn:hover .cart-icon {
  filter: grayscale(1) brightness(2);
}

.cart-icon {
  font-size: 1.3rem;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
