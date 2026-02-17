<script setup>
import { ref, onMounted } from 'vue'
import { getAdminCustomerReport } from '../../services/api'
import html2canvas from 'html2canvas'

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
const adminName = ref('')
const exportTime = ref('')
const isExporting = ref(false)

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
  loading.value = true
  error.value = ''
  orders.value = []

  try {
    const token = localStorage.getItem('adminToken')
    const params = {}
    if (phone.value) params.phone = phone.value
    if (startDate.value) params.startDate = startDate.value
    if (endDate.value) params.endDate = endDate.value

    const response = await getAdminCustomerReport(params)
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

// Auto-load all orders on mount
onMounted(async () => {
  searchOrders()
  loadAdminInfo()
  updateExportTime()  // Initialize export time immediately
})

const loadAdminInfo = () => {
  try {
    // Get admin info from localStorage (saved during login)
    const adminData = localStorage.getItem('adminData')
    if (adminData) {
      const admin = JSON.parse(adminData)
      adminName.value = admin.username || admin.name || 'Admin'
    } else {
      adminName.value = 'Admin'
    }
  } catch (err) {
    adminName.value = 'Admin'
  }
}

const printReport = () => {
    // Update export time before print
    updateExportTime()
    window.print()
}

const updateExportTime = () => {
    const now = new Date()
    exportTime.value = now.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

const exportToPNG = async () => {
    if (isExporting.value) return
    
    isExporting.value = true
    updateExportTime()
    
    try {
        // Wait a bit for the DOM to update with export time
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const element = document.querySelector('.report-content')
        if (!element) {
            alert('Tidak dapat menemukan konten untuk di-export')
            return
        }
        
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        })
        
        const link = document.createElement('a')
        const fileName = `invoice-${phone.value || 'all'}-${Date.now()}.png`
        link.download = fileName
        link.href = canvas.toDataURL('image/png')
        link.click()
    } catch (err) {
        console.error('Error exporting to PNG:', err)
        alert('Gagal export PNG')
    } finally {
        isExporting.value = false
    }
}

const calculateTotal = () => {
    return orders.value.reduce((sum, order) => sum + order.totalPrice, 0)
}

// Filter only completed orders for export
const completedOrders = () => {
    return orders.value.filter(order => order.status === 'completed')
}

const calculateCompletedTotal = () => {
    return completedOrders().reduce((sum, order) => sum + order.totalPrice, 0)
}
</script>

<template>
  <div class="report-container">
    <div class="search-section no-print">
      <h2>Laporan Pembelian Pelanggan</h2>
      <div class="filters">
        <div class="form-group">
          <label>Nomor HP (opsional)</label>
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
        <button v-if="orders.length > 0" @click="exportToPNG" class="btn-export" :disabled="isExporting">
          {{ isExporting ? '⏳ Exporting...' : '📸 Export PNG' }}
        </button>
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>

    <div v-if="orders.length > 0" class="report-content">
      <div class="invoice-header">
        <h1>TAUFIQ STORE</h1>
        <h2>RIWAYAT PEMBELIAN</h2>
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
          <tr v-for="order in completedOrders()" :key="order.id">
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
                <td class="text-right"><strong>{{ formatPrice(calculateCompletedTotal()) }}</strong></td>
            </tr>
        </tfoot>
      </table>
      
      <div class="invoice-footer">
        <p>Terima kasih telah berbelanja di Taufiq Store</p>
        <div v-if="exportTime" class="export-info">
          <p><strong>Dicetak oleh:</strong> {{ adminName }}</p>
          <p><strong>Waktu export:</strong> {{ exportTime }}</p>
        </div>
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

.search-section h2 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
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

.form-group label {
  color: #1f2937;
  font-weight: 500;
}

input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #1f2937;
}

.btn-search, .btn-print, .btn-export {
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

.btn-export {
  background: #8B5CF6;
  color: white;
}

.btn-export:disabled {
  background: #C4B5FD;
  cursor: not-allowed;
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
  font-size: 28px;
  color: #333;
  margin-bottom: 5px;
  font-weight: bold;
}

.invoice-header h2 {
  font-size: 18px;
  color: #1f2937;
  margin-bottom: 10px;
  font-weight: 600;
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
  color: #1f2937;
}

.report-table td {
  color: #1f2937;
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
    color: #1f2937;
    font-size: 0.9rem;
}

.export-info {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
    font-size: 0.85rem;
    color: #333 !important;
}

.export-info p {
    margin: 5px 0;
    color: #333 !important;
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
