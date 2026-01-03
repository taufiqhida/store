<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getCategories, getProducts, getPaymentMethods, getSettings, createOrder, validateDiscount } from './services/api'

// State
const showHero = ref(true)
const categories = ref([])
const products = ref([])
const paymentMethods = ref([])
const settings = ref({})
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedProduct = ref(null)
const selectedVariant = ref(null)
const quantity = ref(1)
const selectedPayment = ref(null)
const loading = ref(false)
const uniqueCode = ref(0)

// Discount state
const discountCode = ref('')
const discountLoading = ref(false)
const discountError = ref('')
const appliedDiscount = ref(null)

// Buyer message
const buyerMessage = ref('')

// Computed
const filteredProducts = computed(() => {
  return products.value
})

// Calculate fee from selected payment method
const paymentFee = computed(() => {
  if (!selectedPayment.value || !selectedVariant.value) return 0
  const pm = selectedPayment.value
  const subtotal = selectedVariant.value.price * quantity.value
  if (pm.feeType === 'percent') {
    return Math.round((subtotal * pm.fees) / 100)
  }
  return pm.fees || 0
})

// Calculate discount amount
const discountAmount = computed(() => {
  if (!appliedDiscount.value || !selectedVariant.value) return 0
  const subtotal = selectedVariant.value.price * quantity.value
  const disc = appliedDiscount.value
  if (disc.type === 'percent') {
    let amount = Math.round((subtotal * disc.value) / 100)
    if (disc.maxDiscount && amount > disc.maxDiscount) {
      amount = disc.maxDiscount
    }
    return amount
  }
  return disc.value || 0
})

// Subtotal before fee and discount
const subtotal = computed(() => {
  if (!selectedVariant.value) return 0
  return selectedVariant.value.price * quantity.value
})

const totalPrice = computed(() => {
  if (!selectedVariant.value) return 0
  return subtotal.value + paymentFee.value - discountAmount.value + uniqueCode.value
})

// Methods
const scrollToProducts = () => {
  showHero.value = false
}

const openProduct = (product) => {
  selectedProduct.value = product
  // Auto-select first available variant
  const firstActiveVariant = product.variants?.find(v => v.isActive !== false)
  selectedVariant.value = firstActiveVariant || null
  quantity.value = 1
  selectedPayment.value = null
  uniqueCode.value = Math.floor(Math.random() * 100) + 1
  // Reset discount state
  discountCode.value = ''
  discountError.value = ''
  appliedDiscount.value = null
  buyerMessage.value = ''
}

const selectVariant = (variant) => {
  if (variant.isActive === false) {
    alert(`Varian "${variant.name}" sedang habis.\n\nSilakan pilih varian lainnya.`)
    return
  }
  selectedVariant.value = variant
}

const closeModal = () => {
  selectedProduct.value = null
  // Reset discount state
  discountCode.value = ''
  discountError.value = ''
  appliedDiscount.value = null
  buyerMessage.value = ''
}

// Apply discount code
const applyDiscount = async () => {
  if (!discountCode.value.trim()) {
    discountError.value = 'Masukkan kode diskon'
    return
  }
  
  discountLoading.value = true
  discountError.value = ''
  
  try {
    const res = await validateDiscount(
      discountCode.value,
      selectedProduct.value?.id,
      subtotal.value
    )
    appliedDiscount.value = res.data.discount
  } catch (error) {
    discountError.value = error.response?.data?.error || 'Kode diskon tidak valid'
    appliedDiscount.value = null
  } finally {
    discountLoading.value = false
  }
}

// Remove applied discount
const removeDiscount = () => {
  discountCode.value = ''
  discountError.value = ''
  appliedDiscount.value = null
}

const fetchData = async () => {
  try {
    const [catRes, prodRes, pmRes, settingsRes] = await Promise.all([
      getCategories(),
      getProducts({ category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined, search: searchQuery.value || undefined }),
      getPaymentMethods(),
      getSettings()
    ])
    categories.value = catRes.data
    products.value = prodRes.data
    paymentMethods.value = pmRes.data
    settings.value = settingsRes.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const searchProducts = async () => {
  const res = await getProducts({
    category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    search: searchQuery.value || undefined
  })
  products.value = res.data
}

const checkout = async () => {
  if (!selectedVariant.value || !selectedPayment.value) {
    alert('Pilih varian dan metode pembayaran terlebih dahulu!')
    return
  }
  
  // Check if selected variant is available
  if (selectedVariant.value.isActive === false) {
    alert(`Varian "${selectedVariant.value.name}" yang Anda pilih sedang habis.\n\nSilakan pilih varian lain atau hubungi Mimin.`)
    return
  }

  loading.value = true
  try {
    const res = await createOrder({
      productName: selectedProduct.value.name,
      variantName: selectedVariant.value.name,
      quantity: quantity.value,
      price: selectedVariant.value.price,
      paymentMethod: selectedPayment.value.name,
      paymentFee: paymentFee.value,
      paymentAccountInfo: selectedPayment.value.accountInfo || null,
      discountCode: appliedDiscount.value?.code || null,
      discountAmount: discountAmount.value,
      buyerMessage: buyerMessage.value || null
    })

    // Redirect to WhatsApp
    window.open(res.data.whatsappUrl, '_blank')
    closeModal()
  } catch (error) {
    console.error('Error creating order:', error)
    alert('Terjadi kesalahan, silakan coba lagi')
  } finally {
    loading.value = false
  }
}


const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const getBadgeClass = (badge) => {
  if (!badge) return ''
  if (badge.toLowerCase() === 'terlaris') return 'badge-terlaris'
  if (badge.toLowerCase().includes('instant')) return 'badge-instant'
  return 'badge-terlaris'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <!-- Hero Section -->
  <section v-if="showHero" class="hero">
    <div class="hero-content">
      <h1 class="hero-logo">{{ settings.store_name || 'Taufiq Store' }}</h1>
      <p class="hero-tagline">{{ settings.store_tagline || 'Premium sat-set Anti Ribet' }}</p>
      <button class="hero-btn" @click="scrollToProducts">
        🛒 Belanja Sekarang
      </button>
    </div>
  </section>

  <!-- Main Content -->
  <div v-else>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container navbar-inner">
        <a href="#" class="nav-logo" @click.prevent="showHero = true">
          {{ settings.store_name || 'Taufiq Store' }}
        </a>
        <div class="nav-links">
          <a :href="`https://wa.me/${settings.whatsapp_number || '6281234567890'}`" target="_blank" class="nav-link primary">
            📞 Contact
          </a>
        </div>
      </div>
    </nav>

    <!-- Products Section -->
    <section class="products-section" style="padding-top: 100px;">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Produk Kami</h2>
          
          <!-- Filters -->
          <div class="filters">
            <input 
              type="text" 
              v-model="searchQuery"
              @input="searchProducts"
              placeholder="🔍 Cari produk favorit..." 
              class="search-input"
            />
            <select 
              v-model="selectedCategory"
              @change="searchProducts"
              class="category-select"
            >
              <option value="all">Semua Kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="product-grid">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="product-card"
            @click="openProduct(product)"
          >
            <img :src="product.image" :alt="product.name" class="product-image" />
            <div class="product-body">
              <span v-if="!product.isActive" class="product-badge badge-habis">Habis</span>
              <span v-else-if="product.badge" :class="['product-badge', getBadgeClass(product.badge)]">
                {{ product.badge }}
              </span>
              <h3 class="product-title">{{ product.name }}</h3>
              <p class="product-category">{{ product.category?.name }}</p>
              <div class="product-price" v-if="product.variants?.length">
                <span class="price-current">Rp {{ formatPrice(product.variants[0].price) }}</span>
                <span class="price-original">Rp {{ formatPrice(product.variants[0].originalPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-payments">
          <span class="payment-logo">📱 QRIS</span>
          <span class="payment-logo">💚 GoPay</span>
          <span class="payment-logo">💜 OVO</span>
          <span class="payment-logo">💙 DANA</span>
          <span class="payment-logo">🧡 ShopeePay</span>
        </div>
        <p class="footer-copyright">
          © {{ new Date().getFullYear() }} {{ settings.store_name || 'Taufiq Store' }}. All rights reserved.
        </p>
      </div>
    </footer>
  </div>

  <!-- Product Modal -->
  <div v-if="selectedProduct" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ selectedProduct.name }}</h3>
        <button class="modal-close" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <img :src="selectedProduct.image" :alt="selectedProduct.name" class="modal-product-image" />
        
        <!-- Sold Out Alert -->
        <div v-if="!selectedProduct.isActive" class="soldout-alert">
          <span class="soldout-icon">😔</span>
          <div>
            <strong>Maaf, produk {{ selectedProduct.name }} sedang habis</strong>
            <p>Silakan tunggu atau hubungi Mimin untuk info restock.</p>
          </div>
        </div>
        
        <p v-else style="margin-bottom: 20px; color: var(--text-secondary);">
          {{ selectedProduct.description }}
        </p>

        <!-- Checkout Steps (only show if product is available) -->
        <template v-if="selectedProduct.isActive">

        <!-- Step 1: Select Variant -->
        <div class="step-section">
          <div class="step-title">
            <span class="step-number">1</span>
            Pilih Produk
          </div>
          <div class="variant-options">
            <div 
              v-for="variant in selectedProduct.variants" 
              :key="variant.id"
              :class="['variant-option', { selected: selectedVariant?.id === variant.id, 'variant-habis': !variant.isActive }]"
              @click="selectVariant(variant)"
            >
              <span class="variant-name">
                {{ variant.name }}
                <span v-if="!variant.isActive" class="variant-stock-label habis">Habis</span>
                <span v-else-if="variant.isWarranty" style="color: var(--success);">✓ Bergaransi</span>
              </span>
              <span class="variant-price">Rp {{ formatPrice(variant.price) }}</span>
            </div>
          </div>
        </div>

        <!-- Step 2: Quantity -->
        <div class="step-section">
          <div class="step-title">
            <span class="step-number">2</span>
            Jumlah
          </div>
          <div class="quantity-control">
            <button class="qty-btn" @click="quantity = Math.max(1, quantity - 1)">−</button>
            <span class="qty-value">{{ quantity }}</span>
            <button class="qty-btn" @click="quantity++">+</button>
          </div>
        </div>

        <!-- Step 3: Payment Method -->
        <div class="step-section">
          <div class="step-title">
            <span class="step-number">3</span>
            Metode Pembayaran
          </div>
          <div class="payment-options">
            <div 
              v-for="pm in paymentMethods" 
              :key="pm.id"
              :class="['payment-option', { selected: selectedPayment?.id === pm.id }]"
              @click="selectedPayment = pm"
            >
              <img v-if="pm.iconType === 'image' && pm.icon" :src="pm.icon" class="pm-icon-img" />
              <span v-else>{{ pm.icon }}</span>
              {{ pm.name }}
              <span v-if="pm.fees > 0" class="pm-fee">+{{ pm.feeType === 'percent' ? pm.fees + '%' : 'Rp ' + formatPrice(pm.fees) }}</span>
            </div>
          </div>
          <!-- Show QRIS if selected payment has qrisImage -->
          <div v-if="selectedPayment?.qrisImage" class="qris-display">
            <p style="margin-bottom: 10px; font-weight: 500;">📱 Scan QRIS untuk pembayaran:</p>
            <img :src="selectedPayment.qrisImage" alt="QRIS" class="qris-image" />
          </div>
          <!-- Show Account Info if available -->
          <div v-if="selectedPayment?.accountInfo" class="account-info-display">
            <p style="font-weight: 500; margin-bottom: 8px;">📋 Transfer ke:</p>
            <pre class="account-info-text">{{ selectedPayment.accountInfo }}</pre>
          </div>
        </div>

        <!-- Step 4: Discount Code -->
        <div class="step-section">
          <div class="step-title">
            <span class="step-number">4</span>
            Kode Diskon (Opsional)
          </div>
          <div class="discount-input-group">
            <input 
              v-model="discountCode" 
              type="text" 
              placeholder="Masukkan kode diskon..."
              class="discount-input"
              :disabled="appliedDiscount"
              @keyup.enter="applyDiscount"
            />
            <button 
              v-if="!appliedDiscount"
              class="discount-btn apply" 
              @click="applyDiscount"
              :disabled="discountLoading"
            >
              {{ discountLoading ? '⏳' : '✓' }} Terapkan
            </button>
            <button 
              v-else 
              class="discount-btn remove" 
              @click="removeDiscount"
            >
              ✕ Hapus
            </button>
          </div>
          <div v-if="discountError" class="discount-error">{{ discountError }}</div>
          <div v-if="appliedDiscount" class="discount-success">
            ✅ Diskon "{{ appliedDiscount.name }}" diterapkan! 
            (-{{ appliedDiscount.type === 'percent' ? appliedDiscount.value + '%' : 'Rp ' + formatPrice(appliedDiscount.value) }})
          </div>
        </div>

        <!-- Step 5: Buyer Message -->
        <div class="step-section">
          <div class="step-title">
            <span class="step-number">5</span>
            Pesan (Opsional)
          </div>
          <textarea 
            v-model="buyerMessage" 
            placeholder="Tulis pesan untuk penjual, misalnya email akun atau catatan lainnya..."
            class="buyer-message"
            rows="2"
          ></textarea>
          </div>
        </template>
      </div>

      <div class="modal-footer" v-if="selectedProduct.isActive">
        <!-- Price Breakdown -->
        <div class="price-breakdown">
          <div class="breakdown-row">
            <span>Subtotal ({{ quantity }}x)</span>
            <span>Rp {{ formatPrice(subtotal) }}</span>
          </div>
          <div v-if="paymentFee > 0" class="breakdown-row fee">
            <span>Fee {{ selectedPayment?.name }}</span>
            <span>+Rp {{ formatPrice(paymentFee) }}</span>
          </div>
          <div v-if="discountAmount > 0" class="breakdown-row discount">
            <span>Diskon {{ appliedDiscount?.code }}</span>
            <span>-Rp {{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="breakdown-row unique">
            <span>Kode Unik</span>
            <span>+{{ uniqueCode }}</span>
          </div>
          <div class="breakdown-total">
            <span>Total Bayar</span>
            <span class="total-amount">Rp {{ formatPrice(totalPrice) }}</span>
          </div>
        </div>
        <button class="buy-btn" @click="checkout" :disabled="loading">
          <span v-if="loading">Loading...</span>
          <span v-else>💬 Beli via WhatsApp</span>
        </button>
      </div>
    </div>
  </div>

</template>

<style>
@import './style.css';
</style>
