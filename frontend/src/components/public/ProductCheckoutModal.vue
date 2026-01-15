<template>
  <div v-if="product" class="modal-overlay" @click.self="$emit('close')">
    <div class="product-modal">
      <button class="modal-close" @click="$emit('close')">×</button>
      
      <div class="modal-grid">
        <!-- Left: Product Info -->
        <div class="modal-left">
          <img :src="product.image" :alt="product.name" class="modal-image" />
          <h2 class="modal-title">{{ product.name }}</h2>
          <p class="modal-category">{{ product.category?.name }}</p>
          <p class="modal-desc">{{ product.description }}</p>
        </div>
        
        <!-- Right: Order Form -->
        <div class="modal-right">
          <h3>Pilih Varian</h3>
          <div class="variant-list">
            <button 
              v-for="v in product.variants" 
              :key="v.id"
              :class="['variant-btn', { selected: selectedVariant?.id === v.id, disabled: !v.isActive }]"
              @click="v.isActive && selectVariant(v)"
            >
              <span class="variant-name">{{ v.name }}</span>
              <span class="variant-price">Rp {{ formatPrice(v.price) }}</span>
              <span v-if="!v.isActive" class="variant-status">HABIS</span>
            </button>
          </div>
          
          <div class="quantity-section">
            <label>Jumlah</label>
            <div class="quantity-controls">
              <button @click="decrementQty" :disabled="quantity <= 1">-</button>
              <input type="number" :value="quantity" min="1" @input="updateQty" />
              <button @click="incrementQty">+</button>
            </div>
          </div>
          
          <h3>Pilih Pembayaran</h3>
          <div class="payment-list">
            <button 
              v-for="pm in paymentMethods" 
              :key="pm.id"
              :class="['payment-btn', { selected: selectedPayment?.id === pm.id }]"
              @click="selectPayment(pm)"
            >
              <span class="payment-icon">
                <img v-if="pm.iconType === 'image' && pm.icon" :src="pm.icon" class="payment-icon-img" />
                <span v-else>{{ pm.icon }}</span>
              </span>
              <span class="payment-name">{{ pm.name }}</span>
              <span v-if="pm.fees > 0" class="payment-fee">
                +{{ pm.feeType === 'percent' ? pm.fees + '%' : 'Rp ' + formatPrice(pm.fees) }}
              </span>
            </button>
          </div>
          
          <!-- Discount Code -->
          <div class="discount-section">
            <label>Kode Promo (Opsional)</label>
            <div class="discount-input-group">
              <input 
                v-model="discountCode"
                placeholder="Masukkan kode promo"
                :disabled="!!appliedDiscount"
              />
              <button 
                v-if="!appliedDiscount"
                @click="$emit('applyDiscount', discountCode)"
                :disabled="discountLoading || !discountCode"
                class="apply-btn"
              >
                {{ discountLoading ? '...' : 'Apply' }}
              </button>
              <button 
                v-else
                @click="$emit('removeDiscount')"
                class="remove-btn"
              >
                ✕
              </button>
            </div>
            <p v-if="discountError" class="discount-error">{{ discountError }}</p>
            <p v-if="appliedDiscount" class="discount-success">
              ✓ Diskon {{ appliedDiscount.name }} berhasil diterapkan!
            </p>
          </div>
          
          <!-- Buyer Message -->
          <div class="message-section">
            <label>Pesan untuk Penjual (Opsional)</label>
            <textarea 
              v-model="buyerMessage" 
              rows="2" 
              placeholder="Tulis catatan atau permintaan khusus..."
            ></textarea>
          </div>
          
          <!-- Price Summary -->
          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>Rp {{ formatPrice(subtotal) }}</span>
            </div>
            <div v-if="discountAmount > 0" class="summary-row discount">
              <span>Diskon</span>
              <span>-Rp {{ formatPrice(discountAmount) }}</span>
            </div>
            <div v-if="paymentFee > 0" class="summary-row">
              <span>Biaya Pembayaran</span>
              <span>+Rp {{ formatPrice(paymentFee) }}</span>
            </div>
            <div v-if="uniqueCode > 0" class="summary-row unique">
              <span>Kode Unik</span>
              <span>+Rp {{ uniqueCode }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>Rp {{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
          
          <button 
            class="checkout-btn"
            @click="$emit('checkout')"
            :disabled="!selectedVariant || !selectedPayment || loading"
          >
            {{ loading ? 'Memproses...' : '🛒 Pesan via WhatsApp' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  product: Object,
  paymentMethods: Array,
  modelVariant: Object,
  modelPayment: Object,
  modelQuantity: Number,
  modelDiscountCode: String,
  appliedDiscount: Object,
  discountLoading: Boolean,
  discountError: String,
  modelBuyerMessage: String,
  subtotal: Number,
  discountAmount: Number,
  paymentFee: Number,
  uniqueCode: Number,
  totalPrice: Number,
  loading: Boolean
})

const emit = defineEmits([
  'close', 'update:modelVariant', 'update:modelPayment', 'update:modelQuantity',
  'update:modelDiscountCode', 'update:modelBuyerMessage', 'applyDiscount', 'removeDiscount', 'checkout'
])

const selectedVariant = ref(props.modelVariant)
const selectedPayment = ref(props.modelPayment)
const quantity = ref(props.modelQuantity || 1)
const discountCode = ref(props.modelDiscountCode || '')
const buyerMessage = ref(props.modelBuyerMessage || '')

watch(() => props.modelVariant, (v) => { selectedVariant.value = v })
watch(() => props.modelPayment, (v) => { selectedPayment.value = v })
watch(() => props.modelQuantity, (v) => { quantity.value = v })
watch(() => props.modelDiscountCode, (v) => { discountCode.value = v })
watch(() => props.modelBuyerMessage, (v) => { buyerMessage.value = v })

const selectVariant = (v) => {
  selectedVariant.value = v
  emit('update:modelVariant', v)
}

const selectPayment = (pm) => {
  selectedPayment.value = pm
  emit('update:modelPayment', pm)
}

const incrementQty = () => {
  quantity.value++
  emit('update:modelQuantity', quantity.value)
}

const decrementQty = () => {
  if (quantity.value > 1) {
    quantity.value--
    emit('update:modelQuantity', quantity.value)
  }
}

const updateQty = (e) => {
  const val = parseInt(e.target.value) || 1
  quantity.value = Math.max(1, val)
  emit('update:modelQuantity', quantity.value)
}

watch(discountCode, (v) => emit('update:modelDiscountCode', v))
watch(buyerMessage, (v) => emit('update:modelBuyerMessage', v))

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  overflow-y: auto;
}

.product-modal {
  background: var(--modal-bg);
  border-radius: 24px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: var(--text);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1;
  color: var(--text);
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.modal-left {
  padding: 30px;
  background: var(--bg-secondary);
}

.modal-image {
  width: 100%;
  max-height: 250px;
  object-fit: contain;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: var(--text);
}

.modal-category {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.modal-desc {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.9rem;
}

.modal-right {
  padding: 30px;
}

.modal-right h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text);
}

.variant-list, .payment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.variant-btn, .payment-btn {
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--card-bg);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  color: var(--text);
}

.variant-btn:hover:not(.disabled), .payment-btn:hover {
  border-color: var(--accent);
}

.variant-btn.selected, .payment-btn.selected {
  border-color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
}

.variant-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.variant-name, .payment-name {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
}

.variant-price {
  font-size: 0.85rem;
  color: var(--accent);
}

.variant-status {
  font-size: 0.7rem;
  color: #dc2626;
  font-weight: 600;
}

.payment-icon {
  font-size: 1.5rem;
  margin-right: 8px;
}

.payment-icon-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.payment-fee {
  font-size: 0.75rem;
  color: var(--warning);
  display: block;
}

.quantity-section {
  margin-bottom: 20px;
}

.quantity-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-controls button {
  width: 36px;
  height: 36px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text);
}

.quantity-controls input {
  width: 60px;
  text-align: center;
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 8px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text);
}

.discount-section, .message-section {
  margin-bottom: 20px;
}

.discount-section label, .message-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text);
}

.discount-input-group {
  display: flex;
  gap: 10px;
}

.discount-input-group input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text);
}

.apply-btn, .remove-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.apply-btn {
  background: var(--accent);
  color: white;
}

.remove-btn {
  background: var(--bg-secondary);
  color: #dc2626;
}

.discount-error {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 5px;
}

.discount-success {
  color: var(--success);
  font-size: 0.8rem;
  margin-top: 5px;
}

.message-section textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  resize: none;
  background: var(--input-bg);
  color: var(--text);
}

.summary-section {
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.9rem;
  color: var(--text);
}

.summary-row.discount {
  color: var(--success);
}

.summary-row.unique {
  color: var(--warning);
}

.summary-row.total {
  font-size: 1.1rem;
  font-weight: 700;
  border-top: 1px solid var(--border);
  margin-top: 8px;
  padding-top: 12px;
  color: var(--accent);
}

.checkout-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-left {
    padding: 20px;
  }

  .modal-right {
    padding: 20px;
  }
}
</style>
