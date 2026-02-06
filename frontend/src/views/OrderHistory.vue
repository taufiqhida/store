<template>
  <div class="order-history-page">
    <Navbar :store-name="storeName" />
    
    <div class="container main-content-padding">
      <div class="search-section">
        <h1 class="page-title">📜 Cek Riwayat Pesanan</h1>
        
        <div class="search-box">
            <input 
                v-model="phone" 
                type="tel" 
                placeholder="Masukan Nomor HP..." 
                @keyup.enter="searchOrders"
            />
            <button @click="searchOrders" :disabled="loading" class="search-btn">
                {{ loading ? 'Mencari...' : '🔍 Cari' }}
            </button>
        </div>
        
        <p class="page-subtitle">Masukkan nomor HP Anda untuk melihat status pesanan</p>

        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>



      <div class="results-section" v-if="searched">
        <div v-if="orders.length === 0" class="no-results">
            <div class="icon">📭</div>
            <h3>Tidak ada pesanan ditemukan</h3>
            <p>Pastikan nomor HP yang dimasukkan benar.</p>
        </div>

        <div v-else class="order-list">
            <div v-for="order in orders" :key="order.id" class="order-card">
                <div class="card-header">
                    <div>
                        <span class="order-code">#{{ order.orderCode }}</span>
                        <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <span :class="['status-badge', order.status]">{{ order.status.toUpperCase() }}</span>
                </div>
                <div class="card-body">
                    <div class="product-info">
                        <h4>{{ order.productName }}</h4>
                        <p class="variant">Varian: {{ order.variantName }} <span class="qty">x{{ order.quantity }}</span></p>
                        <p v-if="order.buyerMessage" class="buyer-msg">📝 Catatan: {{ order.buyerMessage }}</p>
                    </div>
                    <div class="price-info">
                        <p class="payment-method">💳 {{ order.paymentMethod }}</p>
                        <div class="total-price">Total: <strong>Rp {{ formatPrice(order.totalPrice) }}</strong></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
    <Footer :store-name="storeName" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrderHistory, getSettings } from '../services/api'
import Navbar from '../components/public/Navbar.vue'
import Footer from '../components/public/Footer.vue'

const phone = ref('')
const orders = ref([])
const loading = ref(false)
const error = ref('')
const searched = ref(false)
const storeName = ref('TOKO')

onMounted(async () => {
    try {
        const res = await getSettings()
        storeName.value = res.data.store_name || 'TOKO'
    } catch (e) {
        console.error(e)
    }
})

const searchOrders = async () => {
    if (!phone.value) {
        error.value = 'Silakan isi nomor HP'
        return
    }

    loading.value = true
    error.value = ''
    searched.value = false
    orders.value = []

    try {
        const res = await getOrderHistory(phone.value)
        orders.value = res.data
        searched.value = true
    } catch (err) {
        error.value = err.response?.data?.error || 'Gagal mengambil data pesanan'
    } finally {
        loading.value = false
    }
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)
</script>

<style scoped>
.order-history-page {
    min-height: 100vh;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
}

.main-content-padding {
    padding-top: 250px; /* Increased aggressively */
    padding-bottom: 80px;
    flex: 1;
}

@media (max-width: 768px) {
    .main-content-padding {
        padding-top: 280px; /* Extra space for mobile */
    }
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
}

.search-section {
    text-align: center;
    margin-bottom: 40px;
    margin-top: 120px; /* MASSIVE push from navbar */
}

.page-title {
    font-size: 2rem;
    margin-bottom: 20px;
    margin-top: 0;
    color: var(--text);
}

.page-subtitle {
    color: var(--text-secondary);
    margin-top: 15px;
    margin-bottom: 10px;
}

.search-box {
    display: flex;
    max-width: 500px;
    margin: 0 auto;
    gap: 10px;
}

.search-box input {
    flex: 1;
    padding: 12px 20px;
    border-radius: 12px;
    border: 1px solid #ddd;
    font-size: 1rem;
}

.search-btn {
    padding: 12px 24px;
    border-radius: 12px;
    background: var(--primary);
    color: white;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.search-btn:hover:not(:disabled) {
    background: var(--primary-dark);
}

.search-btn:disabled {
    opacity: 0.7;
    cursor: wait;
}

.error-msg {
    color: #ef4444;
    margin-top: 10px;
}

.no-results {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.no-results .icon {
    font-size: 3rem;
    margin-bottom: 10px;
}

.order-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.order-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border: 1px solid #eee;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.order-code {
    font-weight: 700;
    color: var(--primary);
    margin-right: 10px;
}

.order-phone {
    font-size: 0.85rem;
    color: #666;
    margin-right: 10px;
}

.order-date {
    color: #888;
    font-size: 0.9rem;
}

.status-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-badge.pending { background: #fee2e2; color: #dc2626; }
.status-badge.processing { background: #fef3c7; color: #d97706; }
.status-badge.shipped { background: #dbeafe; color: #2563eb; }
.status-badge.completed { background: #d1fae5; color: #059669; }
.status-badge.cancelled { background: #f3f4f6; color: #6b7280; text-decoration: line-through; }

.card-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-info h4 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
}

.variant {
    color: #666;
    margin: 0;
}

.qty {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-left: 5px;
}

.price-info {
    text-align: right;
    font-size: 1.1rem;
}

.buyer-msg {
    font-size: 0.85rem;
    color: #666;
    margin-top: 5px;
    font-style: italic;
    background: #f9f9f9;
    padding: 5px 8px;
    border-radius: 4px;
    display: inline-block;
}

.payment-method {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 5px;
}

.total-price {
    font-size: 1.1rem;
    color: var(--text);
}

@media (max-width: 640px) {
    .card-body {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    .price-info {
        text-align: left;
    }
}
</style>
