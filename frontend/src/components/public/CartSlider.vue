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

          <!-- Payment Selection -->
          <div class="payment-section">
            <h4>💳 Pilih Pembayaran</h4>
            <div class="payment-list">
              <button 
                v-for="pm in paymentMethods" 
                :key="pm.id"
                :class="['payment-btn', { selected: selectedPayment?.id === pm.id }]"
                @click="selectedPayment = pm"
              >
                <span class="payment-icon">{{ pm.icon }}</span>
                <span class="payment-name">{{ pm.name }}</span>
              </button>
            </div>
          </div>

          <!-- Promo Code Section -->
          <div class="promo-section">
            <h4>🏷️ Kode Promo</h4>
            <div v-if="!appliedDiscount" class="promo-input-row">
              <input 
                v-model="promoCode" 
                type="text" 
                placeholder="Masukkan kode promo"
                class="promo-input"
                @keyup.enter="applyPromoCode"
              />
              <button 
                class="promo-btn" 
                @click="applyPromoCode"
                :disabled="promoLoading || !promoCode"
              >
                {{ promoLoading ? '...' : 'Pakai' }}
              </button>
            </div>
            <div v-else class="promo-applied">
              <div class="promo-info">
                <span class="promo-badge">✅ {{ appliedDiscount.code }}</span>
                <span class="promo-discount">
                  -{{ appliedDiscount.type === 'percent' ? appliedDiscount.value + '%' : 'Rp ' + formatPrice(appliedDiscount.value) }}
                </span>
              </div>
              <button class="promo-remove" @click="removePromoCode">×</button>
            </div>
            <p v-if="promoError" class="promo-error">{{ promoError }}</p>
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary">
            <!-- Booking Code & Unique Code -->
            <div class="order-info-box">
              <div class="order-info-row">
                <span class="order-label">📋 Kode Booking</span>
                <span class="order-code">{{ bookingCode }}</span>
              </div>
              <div class="order-info-row">
                <span class="order-label">🔑 Kode Unik</span>
                <span class="unique-code">+Rp {{ uniqueCode }}</span>
              </div>
            </div>

            <div class="summary-row">
              <span>Subtotal ({{ cartCount }} item)</span>
              <span>Rp {{ formatPrice(cartSubtotal) }}</span>
            </div>
            <div v-if="appliedDiscount" class="summary-row discount">
              <span>Diskon ({{ appliedDiscount.code }})</span>
              <span class="discount-price">-Rp {{ formatPrice(discountAmount) }}</span>
            </div>
            <div class="summary-row">
              <span>Kode Unik</span>
              <span class="unique-price">+Rp {{ uniqueCode }}</span>
            </div>
            <div class="summary-row total">
              <span>Total Bayar</span>
              <span class="summary-total">Rp {{ formatPrice(grandTotal) }}</span>
            </div>
            <button 
              class="checkout-btn" 
              @click="handleCheckout"
              :disabled="!selectedPayment"
            >
              {{ selectedPayment ? '📱 Checkout via WhatsApp' : 'Pilih Pembayaran Dulu' }}
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
import { ref, computed, watch } from 'vue'
import { useCart } from '../../composables/useCart'

const props = defineProps({
  paymentMethods: {
    type: Array,
    default: () => []
  }
})

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

const selectedPayment = ref(null)

// Promo code state
const promoCode = ref('')
const promoLoading = ref(false)
const promoError = ref('')
const appliedDiscount = ref(null)

// Generate booking code once when cart opens
const bookingCode = ref('')
const uniqueCode = ref(0)

// Generate codes when cart opens
watch(isCartOpen, (open) => {
  if (open && cartItems.value.length > 0) {
    // Generate booking code
    const today = new Date()
    const dateStr = today.toISOString().slice(0,10).replace(/-/g, '')
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()
    bookingCode.value = `TFQ-${dateStr}-${randomCode}`
    
    // Generate unique code
    uniqueCode.value = Math.floor(Math.random() * 999) + 1
  }
})

// Calculate discount amount
const discountAmount = computed(() => {
  if (!appliedDiscount.value) return 0
  const disc = appliedDiscount.value
  if (disc.type === 'percent') {
    let amount = Math.round((cartSubtotal.value * disc.value) / 100)
    if (disc.maxDiscount && amount > disc.maxDiscount) amount = disc.maxDiscount
    return amount
  }
  return disc.value || 0
})

// Grand total = subtotal - discount + unique code
const grandTotal = computed(() => cartSubtotal.value - discountAmount.value + uniqueCode.value)

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
    appliedDiscount.value = null
    promoCode.value = ''
  }
}

// Apply promo code
const applyPromoCode = async () => {
  if (!promoCode.value) return
  promoLoading.value = true
  promoError.value = ''
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${baseUrl}/discounts/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code: promoCode.value, 
        subtotal: cartSubtotal.value 
      })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Kode tidak valid')
    }
    appliedDiscount.value = data.discount
    promoCode.value = ''
  } catch (error) {
    promoError.value = error.message || 'Kode tidak valid'
  } finally {
    promoLoading.value = false
  }
}

// Remove promo code
const removePromoCode = () => {
  appliedDiscount.value = null
  promoCode.value = ''
  promoError.value = ''
}

const handleCheckout = () => {
  if (!selectedPayment.value) {
    alert('Pilih metode pembayaran terlebih dahulu')
    return
  }
  emit('checkout', {
    payment: selectedPayment.value,
    bookingCode: bookingCode.value,
    uniqueCode: uniqueCode.value,
    discountCode: appliedDiscount.value?.code || null,
    discountAmount: discountAmount.value
  })
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

/* Payment Section */
.payment-section {
  padding: 15px;
  border-top: 1px solid var(--border, #e5e7eb);
}

.payment-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text, #1f2937);
}

.payment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 2px solid var(--border, #e5e7eb);
  border-radius: 10px;
  background: var(--card-bg, #fff);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text, #1f2937);
}

.payment-btn:hover {
  border-color: var(--accent, #3b82f6);
}

.payment-btn.selected {
  border-color: var(--accent, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
}

.payment-icon {
  font-size: 1.2rem;
}

.payment-name {
  font-size: 0.85rem;
  font-weight: 500;
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #9ca3af;
}

/* Order Info Box */
.order-info-box {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 2px dashed #0ea5e9;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.order-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-info-row:last-child {
  margin-bottom: 0;
}

.order-label {
  font-size: 0.85rem;
  color: #0369a1;
  font-weight: 500;
}

.order-code {
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0c4a6e;
  background: white;
  padding: 4px 10px;
  border-radius: 6px;
}

.unique-code {
  font-size: 0.9rem;
  font-weight: 700;
  color: #059669;
}

.summary-row.total {
  border-top: 1px solid var(--border, #e5e7eb);
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 700;
}

.unique-price {
  color: #059669;
}

/* Promo Section */
.promo-section {
  padding: 15px;
  border-top: 1px solid var(--border, #e5e7eb);
}

.promo-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text, #1f2937);
}

.promo-input-row {
  display: flex;
  gap: 8px;
}

.promo-input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid var(--border, #e5e7eb);
  border-radius: 10px;
  font-size: 0.9rem;
  background: var(--card-bg, #fff);
  color: var(--text, #1f2937);
  outline: none;
  transition: all 0.2s;
}

.promo-input:focus {
  border-color: var(--accent, #3b82f6);
}

.promo-input::placeholder {
  color: var(--text-secondary, #9ca3af);
}

.promo-btn {
  padding: 10px 18px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.promo-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.promo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.promo-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 2px solid #10b981;
  border-radius: 10px;
  padding: 10px 14px;
}

.promo-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.promo-badge {
  font-weight: 600;
  color: #059669;
  font-size: 0.9rem;
}

.promo-discount {
  font-weight: 700;
  color: #10b981;
  font-size: 0.95rem;
}

.promo-remove {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.promo-remove:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.promo-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin: 8px 0 0 0;
}

.summary-row.discount {
  color: #10b981;
}

.discount-price {
  color: #10b981;
  font-weight: 600;
}
</style>
