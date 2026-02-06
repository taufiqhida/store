<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  // No props needed for now
})

const phone = ref('')
const startDate = ref('')
const endDate = ref('')
const orders = ref([])
const loading = ref(false)
const error = ref('')
const showInvoice = ref(false)

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const searchOrders = async () => {
  if (!phone.value) {
    error.value = 'Mohon isi nomor HP'
    return
  }

  loading.value = true
  error.value = ''
  orders.value = []

  try {
    const token = localStorage.getItem('adminToken')
    const params = { phone: phone.value }
    if (startDate.value) params.startDate = startDate.value
    if (endDate.value) params.endDate = endDate.value

    const response = await axios.get('http://localhost:3000/api/admin/orders/customer-report', {
      headers: { Authorization: `Bearer ${token}` },
      params
    })
    orders.value = response.data
    if (orders.value.length === 0) {
      error.value = 'Tidak ada pesanan ditemukan'
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Gagal mengambil data'
  } finally {
    loading.value = false
  }
}

const printReport = () => {
    window.print()
}

const calculateTotal = () => {
    return orders.value.reduce((sum, order) => sum + order.totalPrice, 0)
}
</script>

<template>
  <div class="report-container">
    <div class="search-section no-print">
      <h2>Laporan Pembelian Pelanggan</h2>
      <div class="filters">
        <div class="form-group">
          <label>Nomor HP</label>
          <input v-model="phone" type="text" placeholder="Contoh: 08123456789" @keyup.enter="searchOrders">
        </div>
        <div class="form-group">
          <label>Dari Tanggal</label>
          <input v-model="startDate" type="date">
        </div>
        <div class="form-group">
          <label>Sampai Tanggal</label>
          <input v-model="endDate" type="date">
        </div>
        <button @click="searchOrders" class="btn-search" :disabled="loading">
          {{ loading ? 'Mencari...' : 'Cari' }}
        </button>
        <button v-if="orders.length > 0" @click="printReport" class="btn-print">
          🖨️ Cetak / Simpan PDF
        </button>
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>

    <div v-if="orders.length > 0" class="report-content">
      <div class="invoice-header">
        <h1>RIWAYAT PEMBELIAN</h1>
        <div class="customer-info">
            <p><strong>Customer:</strong> {{ phone }}</p>
            <p><strong>Periode:</strong> {{ startDate ? formatDate(startDate) : 'Awal' }} - {{ endDate ? formatDate(endDate) : 'Sekarang' }}</p>
        </div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Kode Pesanan</th>
            <th>Item</th>
            <th>Status</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>{{ order.orderCode }}</td>
            <td>
              {{ order.productName }} ({{ order.variantName }}) x {{ order.quantity }}
            </td>
            <td>
              <span :class="['status-badge', order.status]">{{ order.status }}</span>
            </td>
            <td class="text-right">{{ formatPrice(order.totalPrice) }}</td>
          </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" class="text-right"><strong>Total Pengeluaran</strong></td>
                <td class="text-right"><strong>{{ formatPrice(calculateTotal()) }}</strong></td>
            </tr>
        </tfoot>
      </table>
      
      <div class="invoice-footer">
        <p>Terima kasih telah berbelanja di Taufiq Store</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-container {
  padding: 20px;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  margin-top: 15px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.btn-search, .btn-print {
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  height: 38px;
}

.btn-search {
  background: #3B82F6;
  color: white;
}

.btn-print {
  background: #10B981;
  color: white;
  margin-left: auto;
}

.error-msg {
  color: #EF4444;
  margin-top: 10px;
  font-size: 0.9rem;
}

.report-content {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  max-width: 800px;
  margin: 0 auto;
}

.invoice-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
}

.invoice-header h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.customer-info {
    text-align: left;
    margin-top: 20px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.report-table th, .report-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.report-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.text-right {
  text-align: right;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
.status-badge.pending { background: #FEF3C7; color: #D97706; }
.status-badge.completed { background: #D1FAE5; color: #059669; }
.status-badge.cancelled { background: #FEE2E2; color: #DC2626; }

.invoice-footer {
    text-align: center;
    margin-top: 40px;
    color: #666;
    font-size: 0.9rem;
}

@media print {
  .no-print {
    display: none;
  }
  .report-content {
    box-shadow: none;
    padding: 0;
  }
  .report-container {
    padding: 0;
  }
}
</style>
