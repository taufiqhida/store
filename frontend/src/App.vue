<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getCategories, getProducts, getPaymentMethods, getSettings, createOrder, createCartOrder, validateDiscount, getFlashSales, getTestimonials, submitTestimonial } from './services/api'

// Import Components
import HeroSection from './components/public/HeroSection.vue'
import Navbar from './components/public/Navbar.vue'
import ProductGrid from './components/public/ProductGrid.vue'
import FlashSaleSection from './components/public/FlashSaleSection.vue'
import TestimonialSection from './components/public/TestimonialSection.vue'
import Footer from './components/public/Footer.vue'
import Pagination from './components/public/Pagination.vue'
import ProductCheckoutModal from './components/public/ProductCheckoutModal.vue'
import TestimonialModal from './components/public/TestimonialModal.vue'
import ComingSoonPage from './components/public/ComingSoonPage.vue'
import MaintenancePage from './components/public/MaintenancePage.vue'
import CartSlider from './components/public/CartSlider.vue'

// Cart composable
import { useCart } from './composables/useCart'

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

// Order success state
const orderSuccess = ref(null)

// Discount state
const discountCode = ref('')
const discountLoading = ref(false)
const discountError = ref('')
const appliedDiscount = ref(null)

// Buyer message
const buyerMessage = ref('')

// Flash Sale & Testimonial state
const flashSales = ref([])
const testimonials = ref([])
const showTestimonialModal = ref(false)
const testimonialForm = ref({ orderCode: '', name: '', content: '', rating: 5 })
const testimonialLoading = ref(false)
const testimonialError = ref('')
const testimonialSuccess = ref('')

// Cart
const { cartItems, cartSubtotal, openCart, clearCart, closeCart } = useCart()
const showCartToast = ref(false)
const cartToastMessage = ref('')

// Pagination
const pageProducts = ref(1)
const pageTestimonials = ref(1)
const productsPerPage = 12
const testimonialsPerPage = 6

// Computed
const paginatedProducts = computed(() => {
  const start = (pageProducts.value - 1) * productsPerPage
  return products.value.slice(start, start + productsPerPage)
})
const totalPagesProducts = computed(() => Math.ceil(products.value.length / productsPerPage))

const paginatedTestimonials = computed(() => {
  const start = (pageTestimonials.value - 1) * testimonialsPerPage
  return testimonials.value.slice(start, start + testimonialsPerPage)
})
const totalPagesTestimonials = computed(() => Math.ceil(testimonials.value.length / testimonialsPerPage))

// Rating calculations
const totalReviews = computed(() => testimonials.value?.length || 0)
const averageRating = computed(() => {
  if (!testimonials.value || testimonials.value.length === 0) return 0
  const sum = testimonials.value.reduce((acc, t) => acc + (t.rating || 5), 0)
  return sum / testimonials.value.length
})

// Payment fee calculation
const paymentFee = computed(() => {
  if (!selectedPayment.value || !selectedVariant.value) return 0
  const pm = selectedPayment.value
  const sub = selectedVariant.value.price * quantity.value
  if (pm.feeType === 'percent') return Math.round((sub * pm.fees) / 100)
  return pm.fees || 0
})

// Discount amount
const discountAmount = computed(() => {
  if (!appliedDiscount.value || !selectedVariant.value) return 0
  const sub = selectedVariant.value.price * quantity.value
  const disc = appliedDiscount.value
  if (disc.type === 'percent') {
    let amount = Math.round((sub * disc.value) / 100)
    if (disc.maxDiscount && amount > disc.maxDiscount) amount = disc.maxDiscount
    return amount
  }
  return disc.value || 0
})

// Subtotal & Total
const subtotal = computed(() => selectedVariant.value ? selectedVariant.value.price * quantity.value : 0)
const totalPrice = computed(() => subtotal.value - discountAmount.value + paymentFee.value + uniqueCode.value)

// Site Mode (coming_soon, maintenance, live)
const siteMode = computed(() => settings.value.site_mode || 'live')

// Lifecycle
onMounted(async () => fetchData())

const fetchData = async () => {
  try {
    const [catRes, prodRes, pmRes, settingsRes, flashRes, testiRes] = await Promise.all([
      getCategories(), getProducts(), getPaymentMethods(), getSettings(), getFlashSales(), getTestimonials()
    ])
    categories.value = catRes.data
    products.value = prodRes.data
    paymentMethods.value = pmRes.data
    settings.value = settingsRes.data
    flashSales.value = flashRes.data
    testimonials.value = testiRes.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Product selection
const openProductModal = (product) => {
  selectedProduct.value = product
  selectedVariant.value = product.variants?.find(v => v.isActive) || product.variants?.[0] || null
  selectedPayment.value = paymentMethods.value.find(pm => pm.isActive) || paymentMethods.value[0] || null
  quantity.value = 1
  discountCode.value = ''
  discountError.value = ''
  appliedDiscount.value = null
  buyerMessage.value = ''
  uniqueCode.value = Math.floor(Math.random() * 999) + 1
}

const closeModal = () => {
  selectedProduct.value = null
  selectedVariant.value = null
  selectedPayment.value = null
}

// Flash sale selection
const selectFlashSale = (fs) => {
  const product = products.value.find(p => p.id === fs.productId)
  if (product) openProductModal(product)
}

// Discount
const applyDiscount = async (code) => {
  if (!code) return
  discountLoading.value = true
  discountError.value = ''
  try {
    const res = await validateDiscount({ code, productId: selectedProduct.value?.id, subtotal: subtotal.value })
    appliedDiscount.value = res.data.discount
  } catch (error) {
    discountError.value = error.response?.data?.error || 'Kode tidak valid'
  } finally {
    discountLoading.value = false
  }
}

const removeDiscount = () => {
  appliedDiscount.value = null
  discountCode.value = ''
  discountError.value = ''
}

// Checkout
const checkout = async () => {
  if (!selectedVariant.value || !selectedPayment.value) {
    alert('Pilih varian dan metode pembayaran terlebih dahulu!')
    return
  }
  if (selectedVariant.value.isActive === false) {
    alert(`Varian "${selectedVariant.value.name}" sedang habis.`)
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
    // Save order info and show success modal
    orderSuccess.value = {
      orderCode: res.data.orderCode,
      whatsappUrl: res.data.whatsappUrl,
      total: totalPrice.value,
      productName: selectedProduct.value.name,
      variantName: selectedVariant.value.name
    }
    closeModal()
    window.open(res.data.whatsappUrl, '_blank')
  } catch (error) {
    console.error('Error creating order:', error)
    alert('Terjadi kesalahan, silakan coba lagi')
  } finally {
    loading.value = false
  }
}

// Close order success modal
const closeOrderSuccess = () => {
  orderSuccess.value = null
}

// Testimonial
const openTestimonialModal = () => {
  showTestimonialModal.value = true
  testimonialForm.value = { orderCode: '', name: '', content: '', rating: 5 }
  testimonialError.value = ''
  testimonialSuccess.value = ''
}

const handleSubmitTestimonial = async (form) => {
  if (!form.orderCode || !form.name || !form.content) {
    testimonialError.value = 'Mohon isi semua field yang diperlukan'
    return
  }
  testimonialLoading.value = true
  testimonialError.value = ''
  try {
    await submitTestimonial(form)
    testimonialSuccess.value = 'Testimoni berhasil dikirim! Menunggu persetujuan admin.'
    testimonialForm.value = { orderCode: '', name: '', content: '', rating: 5 }
    const res = await getTestimonials()
    testimonials.value = res.data
  } catch (error) {
    testimonialError.value = error.response?.data?.error || 'Gagal mengirim testimoni'
  } finally {
    testimonialLoading.value = false
  }
}

const enterShop = () => { showHero.value = false }

// Cart toast notification
const showAddedToCartToast = () => {
  cartToastMessage.value = '🛒 Berhasil ditambahkan ke keranjang!'
  showCartToast.value = true
  setTimeout(() => {
    showCartToast.value = false
  }, 3000)
}

// Cart checkout handler
const handleCartCheckout = async (checkoutData) => {
  if (cartItems.value.length === 0) {
    alert('Keranjang masih kosong')
    return
  }
  
  if (!checkoutData?.payment) {
    alert('Pilih metode pembayaran terlebih dahulu')
    return
  }
  
  const { payment, bookingCode, uniqueCode } = checkoutData
  
  try {
    // Prepare cart items for API
    const items = cartItems.value.map(item => ({
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      price: item.price
    }))
    
    // Call API to save orders to database
    const response = await createCartOrder({
      items,
      paymentMethod: payment.name,
      bookingCode,
      uniqueCode
    })
    
    // Open WhatsApp with message from API
    if (response.data.whatsappUrl) {
      window.open(response.data.whatsappUrl, '_blank')
    }
    
    // Clear and close cart after successful checkout
    clearCart()
    closeCart()
    
  } catch (error) {
    console.error('Error creating cart order:', error)
    alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.')
  }
}
</script>

<template>
  <div class="app">
    <!-- Coming Soon Page -->
    <ComingSoonPage 
      v-if="siteMode === 'coming_soon'"
      :store-name="settings.store_name || 'TOKO'"
      :tagline="settings.store_tagline || 'Selamat Datang'"
      :message="settings.coming_soon_message || 'Kami sedang menyiapkan sesuatu yang luar biasa untuk Anda!'"
      :target-date="settings.coming_soon_date || ''"
    />

    <!-- Maintenance Page -->
    <MaintenancePage 
      v-else-if="siteMode === 'maintenance'"
      :store-name="settings.store_name || 'TOKO'"
      :message="settings.maintenance_message || 'Kami sedang melakukan perbaikan untuk memberikan pengalaman yang lebih baik.'"
      :end-date="settings.maintenance_end_date || ''"
    />

    <!-- Normal Store (Live Mode) -->
    <template v-else>
      <!-- Hero Section -->
      <HeroSection 
        :show="showHero"
        :store-name="settings.store_name || 'TOKO'"
        :tagline="settings.store_tagline || 'Selamat Datang'"
        :testimonials="testimonials"
        @enter="enterShop"
      />

      <!-- Main Store -->
      <template v-if="!showHero">
        <Navbar :store-name="settings.store_name || 'TOKO'" />

      <main class="main-content">
        <!-- Flash Sales -->
        <FlashSaleSection 
          :flash-sales="flashSales"
          @select="selectFlashSale"
        />

        <!-- Products Section -->
        <section class="products-section">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">🛍️ Produk Kami</h2>
            </div>
            
            <!-- Category Filter -->
            <div class="category-filter">
              <button 
                :class="['filter-btn', { active: selectedCategory === 'all' }]"
                @click="selectedCategory = 'all'"
              >
                Semua
              </button>
              <button 
                v-for="cat in categories" 
                :key="cat.id"
                :class="['filter-btn', { active: selectedCategory === cat.slug }]"
                @click="selectedCategory = cat.slug"
              >
                {{ cat.name }}
              </button>
            </div>

            <ProductGrid 
              :products="paginatedProducts"
              :testimonials="testimonials"
              @select="openProductModal"
            />

            <Pagination 
              :current-page="pageProducts"
              :total-pages="totalPagesProducts"
              @prev="pageProducts--"
              @next="pageProducts++"
            />
          </div>
        </section>

        <!-- Testimonials -->
        <TestimonialSection 
          :testimonials="paginatedTestimonials"
          @write="openTestimonialModal"
        />

        <Pagination 
          v-if="totalPagesTestimonials > 1"
          :current-page="pageTestimonials"
          :total-pages="totalPagesTestimonials"
          @prev="pageTestimonials--"
          @next="pageTestimonials++"
        />
      </main>

        <Footer :store-name="settings.store_name || 'TOKO'" />
      </template>
    </template>

    <!-- Modals (always available when in live mode) -->
    <template v-if="siteMode === 'live'">

    <ProductCheckoutModal 
      :product="selectedProduct"
      :payment-methods="paymentMethods.filter(pm => pm.isActive)"
      v-model:model-variant="selectedVariant"
      v-model:model-payment="selectedPayment"
      v-model:model-quantity="quantity"
      v-model:model-discount-code="discountCode"
      v-model:model-buyer-message="buyerMessage"
      :applied-discount="appliedDiscount"
      :discount-loading="discountLoading"
      :discount-error="discountError"
      :subtotal="subtotal"
      :discount-amount="discountAmount"
      :payment-fee="paymentFee"
      :unique-code="uniqueCode"
      :total-price="totalPrice"
      :loading="loading"
      @close="closeModal"
      @apply-discount="applyDiscount"
      @remove-discount="removeDiscount"
      @checkout="checkout"
      @added-to-cart="showAddedToCartToast"
    />

    <!-- Cart Slider -->
    <CartSlider 
      :payment-methods="paymentMethods.filter(pm => pm.isActive)"
      @checkout="handleCartCheckout" 
    />

    <!-- Cart Toast -->
    <Transition name="toast">
      <div v-if="showCartToast" class="cart-toast" @click="openCart">
        {{ cartToastMessage }}
        <span class="view-cart">Lihat Keranjang →</span>
      </div>
    </Transition>

    <!-- Testimonial Modal -->
    <TestimonialModal 
      :show="showTestimonialModal"
      v-model="testimonialForm"
      :loading="testimonialLoading"
      :error="testimonialError"
      :success="testimonialSuccess"
      @close="showTestimonialModal = false"
      @submit="handleSubmitTestimonial"
    />

    <!-- Order Success Modal -->
    <div v-if="orderSuccess" class="order-success-overlay" @click.self="closeOrderSuccess">
      <div class="order-success-modal">
        <div class="success-icon">✅</div>
        <h2>Pesanan Berhasil!</h2>
        <p>Simpan kode pemesanan Anda:</p>
        <div class="order-code">{{ orderSuccess.orderCode }}</div>
        <div class="order-details">
          <p><strong>Produk:</strong> {{ orderSuccess.productName }}</p>
          <p><strong>Varian:</strong> {{ orderSuccess.variantName }}</p>
          <p><strong>Total:</strong> Rp {{ new Intl.NumberFormat('id-ID').format(orderSuccess.total) }}</p>
        </div>
        <p class="order-note">📱 WhatsApp sudah terbuka di tab baru. Kirim pesan untuk konfirmasi pesanan.</p>
        <div class="order-actions">
          <button class="btn-copy" @click="navigator.clipboard.writeText(orderSuccess.orderCode); alert('Kode disalin!')">
            📋 Salin Kode
          </button>
          <button class="btn-wa" @click="window.open(orderSuccess.whatsappUrl, '_blank')">
            💬 Buka WhatsApp
          </button>
          <button class="btn-close" @click="closeOrderSuccess">Tutup</button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.main-content {
  padding-top: 70px;
}

.products-section {
  padding: 60px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  background: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #3B82F6;
}

.filter-btn.active {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

/* Order Success Modal */
.order-success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.order-success-modal {
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 450px;
  width: 100%;
  text-align: center;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.order-success-modal h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 10px;
}

.order-code {
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
  padding: 20px;
  border-radius: 16px;
  margin: 20px 0;
  letter-spacing: 3px;
  font-family: monospace;
}

.order-details {
  background: #f9fafb;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
  text-align: left;
}

.order-details p {
  margin: 8px 0;
  font-size: 0.95rem;
}

.order-note {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.order-actions button {
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-copy {
  background: #f3f4f6;
  color: #374151;
}

.btn-copy:hover {
  background: #e5e7eb;
}

.btn-wa {
  background: #25D366;
  color: white;
}

.btn-wa:hover {
  background: #1DA851;
}

.btn-close {
  background: #3B82F6;
  color: white;
}

.btn-close:hover {
  background: #2563EB;
}

/* Cart Toast */
.cart-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 16px 24px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  z-index: 4000;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
  display: flex;
  align-items: center;
  gap: 15px;
  animation: bounce 0.5s ease;
}

.cart-toast:hover {
  transform: translateX(-50%) scale(1.02);
}

.view-cart {
  opacity: 0.9;
  font-size: 0.9rem;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(30px);
}
</style>
