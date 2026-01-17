<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal order-detail-modal">
      <div class="modal-header">
        <h3>📋 Detail Pesanan</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="order-info-grid">
          <div class="info-section">
            <h4>🎫 Informasi Pesanan</h4>
            <div class="info-row">
              <span class="label">Kode Order:</span>
              <code class="order-code">{{ order.orderCode }}</code>
            </div>
            <div class="info-row">
              <span class="label">Tanggal:</span>
              <span>{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span :class="['status-badge', order.status]">{{ statusLabel }}</span>
            </div>
          </div>

          <div class="info-section">
            <h4>📦 Produk</h4>
            <div class="info-row">
              <span class="label">Nama Produk:</span>
              <span><strong>{{ order.productName }}</strong></span>
            </div>
            <div class="info-row">
              <span class="label">Varian:</span>
              <span>{{ order.variantName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Jumlah:</span>
              <span>{{ order.quantity }} pcs</span>
            </div>
          </div>

          <div class="info-section">
            <h4>💰 Pembayaran</h4>
            <div class="info-row">
              <span class="label">Harga Satuan:</span>
              <span>Rp {{ formatPrice(order.price) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Subtotal:</span>
              <span>Rp {{ formatPrice(order.price * order.quantity) }}</span>
            </div>
            <div class="info-row" v-if="order.paymentFee">
              <span class="label">Biaya Pembayaran:</span>
              <span>+Rp {{ formatPrice(order.paymentFee) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Kode Unik:</span>
              <span>+Rp {{ formatPrice(order.uniqueCode) }}</span>
            </div>
            <div class="info-row" v-if="order.discountAmount">
              <span class="label">Diskon {{ order.discountCode ? `(${order.discountCode})` : '' }}:</span>
              <span class="discount">-Rp {{ formatPrice(order.discountAmount) }}</span>
            </div>
            <div class="info-row total">
              <span class="label">Total:</span>
              <span class="total-price">Rp {{ formatPrice(order.totalPrice) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Metode:</span>
              <span class="payment-method">{{ order.paymentMethod }}</span>
            </div>
            <div class="info-row" v-if="order.paymentAccountInfo">
              <span class="label">Info Akun:</span>
              <span class="account-info">{{ order.paymentAccountInfo }}</span>
            </div>
          </div>

          <div class="info-section" v-if="order.buyerMessage">
            <h4>💬 Catatan Pembeli</h4>
            <div class="buyer-message-box">
              {{ order.buyerMessage }}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const statusLabels = {
  pending: '⏳ Pending',
  confirmed: '✅ Dikonfirmasi',
  processing: '🔄 Diproses',
  shipped: '📦 Dikirim',
  completed: '✔️ Selesai',
  cancelled: '❌ Dibatalkan'
}

const statusLabel = computed(() => statusLabels[props.order.status] || props.order.status)

const formatPrice = (num) => new Intl.NumberFormat('id-ID').format(num)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 25px;
}

.order-info-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 15px 20px;
}

.info-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #6b7280;
  font-size: 0.85rem;
}

.order-code {
  background: #e5e7eb;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.confirmed,
.status-badge.processing,
.status-badge.shipped {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.completed {
  background: #d1fae5;
  color: #059669;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.discount {
  color: #dc2626;
}

.info-row.total {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 2px solid #e5e7eb;
  border-bottom: none;
}

.total-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
}

.payment-method {
  background: #e5e7eb;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
}

.account-info {
  font-size: 0.85rem;
  color: #6b7280;
}

.buyer-message-box {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #374151;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
