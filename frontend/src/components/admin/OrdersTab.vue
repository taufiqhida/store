<template>
  <div>
    <!-- Analytics Cards -->
    <div class="analytics-grid">
      <div class="analytics-card revenue">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <span class="card-label">Total Pendapatan</span>
          <span class="card-value">Rp {{ formatPrice(analytics.totalRevenue) }}</span>
        </div>
      </div>
      <div class="analytics-card today">
        <div class="card-icon">📅</div>
        <div class="card-content">
          <span class="card-label">Hari Ini</span>
          <span class="card-value">Rp {{ formatPrice(analytics.todayRevenue) }}</span>
        </div>
      </div>
      <div class="analytics-card week">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <span class="card-label">Minggu Ini</span>
          <span class="card-value">Rp {{ formatPrice(analytics.weekRevenue) }}</span>
        </div>
      </div>
      <div class="analytics-card month">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <span class="card-label">Bulan Ini</span>
          <span class="card-value">Rp {{ formatPrice(analytics.monthRevenue) }}</span>
        </div>
      </div>
    </div>

    <!-- Top Products & Payment Stats -->
    <div class="stats-row" v-if="analytics.topProducts?.length">
      <div class="stats-card">
        <h4>🏆 Produk Terlaris</h4>
        <div class="top-list">
          <div v-for="(prod, idx) in analytics.topProducts" :key="idx" class="top-item">
            <span class="rank">{{ idx + 1 }}</span>
            <span class="name">{{ prod.name }}</span>
            <span class="sales">Rp {{ formatPrice(prod.sales) }}</span>
          </div>
        </div>
      </div>
      <div class="stats-card" v-if="analytics.paymentStats?.length">
        <h4>💳 Pembayaran Populer</h4>
        <div class="top-list">
          <div v-for="(pm, idx) in analytics.paymentStats" :key="idx" class="top-item">
            <span class="rank">{{ idx + 1 }}</span>
            <span class="name">{{ pm.method }}</span>
            <span class="sales">{{ pm.count }}x</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-header">
      <h2>📋 Daftar Pesanan</h2>
      <div class="order-stats">
        <span class="stat pending">{{ pendingCount }} Pending</span>
        <span class="stat confirmed">{{ confirmedCount }} Diproses</span>
        <span class="stat completed">{{ completedCount }} Selesai</span>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode Order</th>
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Pembayaran</th>
            <th>Catatan</th>
            <th>Status</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedItems" :key="order.id">
            <td><code class="order-code">{{ order.orderCode }}</code></td>
            <td><strong>{{ order.productName }}</strong></td>
            <td>{{ order.variantName }}</td>
            <td class="qty">{{ order.quantity }}</td>
            <td class="price">Rp {{ formatPrice(order.totalPrice) }}</td>
            <td>
              <span class="payment-badge">{{ order.paymentMethod }}</span>
            </td>
            <td class="message-cell">
              <span v-if="order.buyerMessage" class="buyer-message" :title="order.buyerMessage">
                💬 {{ truncate(order.buyerMessage, 30) }}
              </span>
              <span v-else class="no-message">-</span>
            </td>
            <td>
              <select 
                :value="order.status" 
                @change="$emit('updateStatus', order, $event.target.value)"
                :class="['status-select', order.status]"
              >
                <option value="pending">⏳ Pending</option>
                <option value="confirmed">✅ Dikonfirmasi</option>
                <option value="processing">🔄 Diproses</option>
                <option value="shipped">📦 Dikirim</option>
                <option value="completed">✔️ Selesai</option>
                <option value="cancelled">❌ Dibatalkan</option>
              </select>
            </td>
            <td class="date">{{ formatDate(order.createdAt) }}</td>
            <td>
              <button class="btn btn-sm btn-view" @click="$emit('view', order)" title="Lihat Detail">👁️</button>
              <button class="btn btn-sm btn-delete" @click="$emit('delete', order)" title="Hapus">🗑️</button>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td colspan="10" class="empty-state">
              <span>📭 Belum ada pesanan</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination 
      v-if="totalPages > 1"
      :current-page="currentPage" 
      :total-pages="totalPages"
      @prev="$emit('update:currentPage', currentPage - 1)"
      @next="$emit('update:currentPage', currentPage + 1)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Pagination from './Pagination.vue'

const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  analytics: {
    type: Object,
    default: () => ({
      totalRevenue: 0,
      todayRevenue: 0,
      weekRevenue: 0,
      monthRevenue: 0,
      totalOrders: 0,
      statusCounts: {},
      topProducts: [],
      paymentStats: []
    })
  },
  currentPage: {
    type: Number,
    default: 1
  },
  itemsPerPage: {
    type: Number,
    default: 10
  }
})

defineEmits(['updateStatus', 'view', 'delete', 'update:currentPage'])

const paginatedItems = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  return props.orders.slice(start, start + props.itemsPerPage)
})

const totalPages = computed(() => Math.ceil(props.orders.length / props.itemsPerPage))

const pendingCount = computed(() => props.orders.filter(o => o.status === 'pending').length)
const confirmedCount = computed(() => props.orders.filter(o => o.status === 'confirmed' || o.status === 'processing' || o.status === 'shipped').length)
const completedCount = computed(() => props.orders.filter(o => o.status === 'completed').length)

const formatPrice = (num) => new Intl.NumberFormat('id-ID').format(num)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.order-stats {
  display: flex;
  gap: 10px;
}

.stat {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat.pending {
  background: #fef3c7;
  color: #d97706;
}

.stat.confirmed {
  background: #dbeafe;
  color: #2563eb;
}

.stat.completed {
  background: #d1fae5;
  color: #059669;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6b7280;
}

.order-code {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  color: #374151;
}

.qty {
  text-align: center;
  font-weight: 600;
}

.price {
  font-weight: 600;
  color: #059669;
  white-space: nowrap;
}

.payment-badge {
  background: #e5e7eb;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.message-cell {
  max-width: 150px;
}

.buyer-message {
  font-size: 0.85rem;
  color: #6b7280;
  cursor: help;
}

.no-message {
  color: #d1d5db;
}

.status-select {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  background: white;
}

.status-select.pending {
  border-color: #fbbf24;
  color: #d97706;
}

.status-select.confirmed, 
.status-select.processing,
.status-select.shipped {
  border-color: #3b82f6;
  color: #2563eb;
}

.status-select.completed {
  border-color: #10b981;
  color: #059669;
}

.status-select.cancelled {
  border-color: #ef4444;
  color: #dc2626;
}

.date {
  font-size: 0.8rem;
  color: #6b7280;
  white-space: nowrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 0.8rem;
}

.btn-view {
  background: #dbeafe;
  color: #2563eb;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
  margin-left: 5px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: #9ca3af;
  font-size: 1rem;
}

/* Analytics Cards */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.analytics-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.analytics-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.card-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.analytics-card.revenue .card-icon {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.analytics-card.today .card-icon {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.analytics-card.week .card-icon {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.analytics-card.month .card-icon {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.card-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stats-card h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #374151;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.top-item:last-child {
  border-bottom: none;
}

.top-item .rank {
  width: 24px;
  height: 24px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
}

.top-item .name {
  flex: 1;
  font-size: 0.9rem;
  color: #374151;
}

.top-item .sales {
  font-size: 0.85rem;
  font-weight: 600;
  color: #059669;
}

@media (max-width: 1024px) {
  .analytics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
