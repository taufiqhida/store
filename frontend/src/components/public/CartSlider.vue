<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="isCartOpen" class="cart-overlay" @click="closeCart"></div>
    </Transition>

    <!-- Cart Slider -->
    <Transition name="slide">
      <div v-if="isCartOpen" class="cart-slider">
        <div class="cart-header">
          <h2>🛒 Keranjang</h2>
          <button class="close-btn" @click="closeCart">&times;</button>
        </div>

        <!-- Empty State -->
        <div v-if="cartItems.length === 0" class="cart-empty">
          <span class="empty-icon">🛒</span>
          <p>Keranjang masih kosong</p>
          <button class="browse-btn" @click="closeCart">Belanja Sekarang</button>
        </div>

        <!-- Cart Items -->
        <div v-else class="cart-content">
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <img :src="item.productImage" :alt="item.productName" class="item-image" />
              <div class="item-details">
                <h4 class="item-name">{{ item.productName }}</h4>
                <p class="item-variant">{{ item.variantName }}</p>
                <p class="item-price">Rp {{ formatPrice(item.price) }}</p>
              </div>
              <div class="item-actions">
                <div class="qty-controls">
                  <button @click="decrementQty(item)" :disabled="item.quantity <= 1">-</button>
                  <span class="qty">{{ item.quantity }}</span>
                  <button @click="incrementQty(item)">+</button>
                </div>
                <button class="remove-btn" @click="removeItem(item)">🗑️</button>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary">
            <div class="summary-row">
              <span>Total ({{ cartCount }} item)</span>
              <span class="summary-total">Rp {{ formatPrice(cartSubtotal) }}</span>
            </div>
            <button class="checkout-btn" @click="handleCheckout">
              Checkout via WhatsApp
            </button>
            <button class="clear-btn" @click="handleClearCart">
              Kosongkan Keranjang
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useCart } from '../../composables/useCart'

const { 
  cartItems, 
  cartCount, 
  cartSubtotal, 
  isCartOpen, 
  closeCart, 
  updateQuantity, 
  removeFromCart,
  clearCart
} = useCart()

const emit = defineEmits(['checkout'])

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)

const incrementQty = (item) => {
  updateQuantity(item.id, item.quantity + 1)
}

const decrementQty = (item) => {
  if (item.quantity > 1) {
    updateQuantity(item.id, item.quantity - 1)
  }
}

const removeItem = (item) => {
  removeFromCart(item.id)
}

const handleClearCart = () => {
  if (confirm('Yakin ingin mengosongkan keranjang?')) {
    clearCart()
  }
}

const handleCheckout = () => {
  emit('checkout')
}
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2999;
}

.cart-slider {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100%;
  height: 100vh;
  background: var(--modal-bg, #fff);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.2);
}

.cart-header {
  padding: 20px;
  border-bottom: 1px solid var(--border, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text, #1f2937);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary, #f3f4f6);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text, #1f2937);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--border, #e5e7eb);
}

/* Empty State */
.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.cart-empty p {
  color: var(--text-secondary, #6b7280);
  margin-bottom: 20px;
}

.browse-btn {
  padding: 12px 24px;
  background: var(--accent, #3b82f6);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(59, 130, 246, 0.3);
}

/* Cart Content */
.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 15px;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 12px;
  margin-bottom: 12px;
}

.item-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--card-bg, #fff);
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text, #1f2937);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-variant {
  font-size: 0.8rem;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 6px 0;
}

.item-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent, #3b82f6);
  margin: 0;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  padding: 4px;
}

.qty-controls button {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: var(--bg-secondary, #e5e7eb);
  color: var(--text, #1f2937);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-controls button:hover:not(:disabled) {
  background: var(--accent, #3b82f6);
  color: white;
}

.qty-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: var(--text, #1f2937);
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: all 0.2s;
}

.remove-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Cart Summary */
.cart-summary {
  padding: 20px;
  border-top: 1px solid var(--border, #e5e7eb);
  background: var(--modal-bg, #fff);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1rem;
  color: var(--text, #1f2937);
}

.summary-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent, #3b82f6);
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 10px;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.clear-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-secondary, #f3f4f6);
  color: #dc2626;
  border-color: #dc2626;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Mobile */
@media (max-width: 480px) {
  .cart-slider {
    width: 100%;
  }

  .cart-item {
    flex-wrap: wrap;
  }

  .item-details {
    flex: none;
    width: calc(100% - 82px);
  }

  .item-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
  }
}
</style>
