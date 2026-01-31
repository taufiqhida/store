<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getAdminProducts, getSettings, createProduct, updateProduct, deleteProduct, updateSettings,
  getAdminCategories, createCategory, updateCategory, deleteCategory,
  getAdminPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  getAdminDiscounts, createDiscount, updateDiscount, deleteDiscount,
  uploadImage, updateAdminCredentials,
  getAdminFlashSales, createFlashSale, updateFlashSale, deleteFlashSale,
  getAdminTestimonials, updateTestimonial, deleteTestimonial,
  getAdminArticles, createArticle, updateArticle, deleteArticle,
  getAdminOrders, getOrderAnalytics, updateOrderStatus, deleteOrder,
  getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, restoreAdminUser
} from '../services/api'
import { usePermissions } from '../composables/usePermissions'

// Import Components
import AdminHeader from '../components/admin/AdminHeader.vue'
import AdminTabs from '../components/admin/AdminTabs.vue'
import ProductsTab from '../components/admin/ProductsTab.vue'
import CategoriesTab from '../components/admin/CategoriesTab.vue'
import PaymentsTab from '../components/admin/PaymentsTab.vue'
import DiscountsTab from '../components/admin/DiscountsTab.vue'
import FlashSalesTab from '../components/admin/FlashSalesTab.vue'
import TestimonialsTab from '../components/admin/TestimonialsTab.vue'
import ArticlesTab from '../components/admin/ArticlesTab.vue'
import OrdersTab from '../components/admin/OrdersTab.vue'
import AdminUsersTab from '../components/admin/AdminUsersTab.vue'

// Import Modals
import ProductModal from '../components/modals/ProductModal.vue'
import FlashSaleModal from '../components/modals/FlashSaleModal.vue'
import CategoryModal from '../components/modals/CategoryModal.vue'
import PaymentModal from '../components/modals/PaymentModal.vue'
import DiscountModal from '../components/modals/DiscountModal.vue'
import ArticleModal from '../components/modals/ArticleModal.vue'
import SettingsModal from '../components/modals/SettingsModal.vue'
import CredentialsModal from '../components/modals/CredentialsModal.vue'
import OrderDetailModal from '../components/modals/OrderDetailModal.vue'
import AdminUserModal from '../components/modals/AdminUserModal.vue'

const router = useRouter()
const { hasPermission, clearPermissions } = usePermissions()

// Data state
const products = ref([])
const categories = ref([])
const paymentMethods = ref([])
const discounts = ref([])
const flashSales = ref([])
const testimonials = ref([])
const articles = ref([])
const orders = ref([])
const orderAnalytics = ref({})
const settings = ref({})
const adminName = ref('')
const adminUsers = ref([])

// UI state
const activeTab = ref('orders')
const loading = ref(true)

// Modal visibility
const showProductModal = ref(false)
const showCategoryModal = ref(false)
const showPaymentModal = ref(false)
const showDiscountModal = ref(false)
const showFlashSaleModal = ref(false)
const showArticleModal = ref(false)
const showSettingsModal = ref(false)
const showCredentialsModal = ref(false)
const showOrderDetailModal = ref(false)
const showAdminUserModal = ref(false)

// Editing state
const editingProduct = ref(null)
const editingCategory = ref(null)
const editingPayment = ref(null)
const editingDiscount = ref(null)
const editingFlashSale = ref(null)
const editingArticle = ref(null)
const editingAdminUser = ref(null)

// Pagination state
const pageProducts = ref(1)
const pageCategories = ref(1)
const pagePayments = ref(1)
const pageDiscounts = ref(1)
const pageFlashSales = ref(1)
const pageTestimonials = ref(1)
const pageArticles = ref(1)
const pageOrders = ref(1)
const itemsPerPage = 10

// Selected order for detail view
const selectedOrder = ref(null)

// Forms
const productForm = ref({ name: '', slug: '', description: '', image: '', badge: '', categoryId: '', variants: [], isActive: true })
const categoryForm = ref({ name: '', slug: '' })
const paymentForm = ref({ name: '', icon: '💳', iconType: 'emoji', accountInfo: '', feeType: 'fixed', fees: 0, currency: 'IDR', qrisImage: '', isActive: true })
const discountForm = ref({ code: '', name: '', type: 'fixed', value: 0, maxDiscount: null, minPurchase: null, applyTo: 'all', productIds: [], usageLimit: null, expiresAt: null, isActive: true })
const flashSaleForm = ref({ title: '', description: '', productId: '', variantId: '', discountPercent: 10, startDate: '', endDate: '', isActive: true })
const articleForm = ref({ title: '', slug: '', content: '', image: '', isPublished: false })
const settingsForm = ref({})
const credentialsForm = ref({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' })
const credentialsError = ref('')
const adminUserForm = ref({ username: '', password: '', name: '', email: '', role: 'ADMIN', permissions: [] })
const adminUserError = ref('')

// Tabs config
const tabs = computed(() => [
  { id: 'orders', icon: '📋', label: 'Pesanan', count: orders.value.length },
  { id: 'products', icon: '📦', label: 'Produk', count: products.value.length },
  { id: 'categories', icon: '📁', label: 'Kategori', count: categories.value.length },
  { id: 'payments', icon: '💳', label: 'Pembayaran', count: paymentMethods.value.length },
  { id: 'discounts', icon: '🏷️', label: 'Diskon', count: discounts.value.length },
  { id: 'flashsales', icon: '⚡', label: 'Flash Sale', count: flashSales.value.length },
  { id: 'testimonials', icon: '💬', label: 'Testimoni', count: testimonials.value.length },
  { id: 'articles', icon: '📰', label: 'Artikel', count: articles.value.length },
  { id: 'adminusers', icon: '👥', label: 'Admin Users', count: adminUsers.value.length }
].filter(tab => {
  // Filter tabs based on permissions
  if (tab.id === 'adminusers') return hasPermission('admin_users')
  if (tab.id === 'orders') return hasPermission('orders')
  if (tab.id === 'products') return hasPermission('products')
  if (tab.id === 'categories') return hasPermission('categories')
  if (tab.id === 'payments') return hasPermission('payments')
  if (tab.id === 'discounts') return hasPermission('discounts')
  if (tab.id === 'flashsales') return hasPermission('flashsales')
  if (tab.id === 'testimonials') return hasPermission('testimonials')
  if (tab.id === 'articles') return hasPermission('articles')
  return true
}))

// Check auth and fetch data
onMounted(async () => {
  const token = localStorage.getItem('adminToken')
  if (!token) {
    router.push('/admin/login')
    return
  }
  adminName.value = localStorage.getItem('adminName') || 'Admin'
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const [prodRes, catRes, pmRes, discRes, fsRes, testiRes, artRes, ordRes, analyticsRes, settRes] = await Promise.all([
      getAdminProducts(), getAdminCategories(), getAdminPaymentMethods(), getAdminDiscounts(),
      getAdminFlashSales(), getAdminTestimonials(), getAdminArticles(), getAdminOrders(), getOrderAnalytics(), getSettings()
    ])
    products.value = prodRes.data
    categories.value = catRes.data
    paymentMethods.value = pmRes.data
    discounts.value = discRes.data
    flashSales.value = fsRes.data
    testimonials.value = testiRes.data
    articles.value = artRes.data
    orders.value = ordRes.data
    orderAnalytics.value = analyticsRes.data
    settings.value = settRes.data
    settingsForm.value = { ...settRes.data }
    
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
  
  // Fetch admin users AFTER main data to avoid blocking on error
  try {
    if (hasPermission('admin_users')) {
      const usersRes = await getAdminUsers()
      adminUsers.value = usersRes.data
    }
  } catch (error) {
    console.error('Error fetching admin users:', error)
    // Don't fail the whole dashboard if admin users fetch fails
  }
}

const logout = () => {
  clearPermissions()
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminName')
  router.push('/admin/login')
}

// ========== PRODUCT FUNCTIONS ==========
const openAddProduct = () => {
  editingProduct.value = null
  productForm.value = { name: '', slug: '', description: '', image: '', badge: '', categoryId: categories.value[0]?.id || '', variants: [{ name: '', price: 0, originalPrice: 0, isWarranty: false, isActive: true }], isActive: true }
  showProductModal.value = true
}

const openEditProduct = (product) => {
  editingProduct.value = product
  productForm.value = { ...product, categoryId: product.categoryId, variants: [...(product.variants || [])] }
  showProductModal.value = true
}

const saveProduct = async (formData) => {
  try {
    const data = { ...formData, categoryId: parseInt(formData.categoryId) }
    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, data)
    } else {
      await createProduct(data)
    }
    showProductModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving product:', error)
    alert('Gagal menyimpan produk')
  }
}

const confirmDeleteProduct = async (product) => {
  if (confirm(`Hapus produk "${product.name}"?`)) {
    try {
      await deleteProduct(product.id)
      fetchData()
    } catch (error) {
      alert('Gagal menghapus produk')
    }
  }
}

// ========== CATEGORY FUNCTIONS ==========
const openAddCategory = () => {
  editingCategory.value = null
  categoryForm.value = { name: '', slug: '' }
  showCategoryModal.value = true
}

const openEditCategory = (cat) => {
  editingCategory.value = cat
  categoryForm.value = { name: cat.name, slug: cat.slug }
  showCategoryModal.value = true
}

const saveCategory = async (formData) => {
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, formData)
    } else {
      await createCategory(formData)
    }
    showCategoryModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving category:', error)
    alert('Gagal menyimpan kategori')
  }
}

const confirmDeleteCategory = async (cat) => {
  if (confirm(`Hapus kategori "${cat.name}"?`)) {
    try {
      await deleteCategory(cat.id)
      fetchData()
    } catch (error) {
      alert('Gagal menghapus kategori. Pastikan tidak ada produk yang menggunakan kategori ini.')
    }
  }
}

// ========== PAYMENT FUNCTIONS ==========
const openAddPayment = () => {
  editingPayment.value = null
  paymentForm.value = { name: '', icon: '💳', iconType: 'emoji', accountInfo: '', feeType: 'fixed', fees: 0, currency: 'IDR', qrisImage: '', isActive: true }
  showPaymentModal.value = true
}

const openEditPayment = (pm) => {
  editingPayment.value = pm
  paymentForm.value = { ...pm }
  showPaymentModal.value = true
}

const savePayment = async (formData) => {
  try {
    if (editingPayment.value) {
      await updatePaymentMethod(editingPayment.value.id, formData)
    } else {
      await createPaymentMethod(formData)
    }
    showPaymentModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving payment:', error)
    alert('Gagal menyimpan metode pembayaran')
  }
}

const confirmDeletePayment = async (pm) => {
  if (confirm(`Hapus metode pembayaran "${pm.name}"?`)) {
    try {
      await deletePaymentMethod(pm.id)
      fetchData()
    } catch (error) {
      alert('Gagal menghapus metode pembayaran')
    }
  }
}

// ========== DISCOUNT FUNCTIONS ==========
const openAddDiscount = () => {
  editingDiscount.value = null
  discountForm.value = { code: '', name: '', type: 'fixed', value: 0, maxDiscount: null, minPurchase: null, applyTo: 'all', productIds: [], usageLimit: null, expiresAt: null, isActive: true }
  showDiscountModal.value = true
}

const openEditDiscount = (disc) => {
  editingDiscount.value = disc
  discountForm.value = { ...disc, productIds: disc.productIds ? JSON.parse(disc.productIds) : [] }
  showDiscountModal.value = true
}

const saveDiscount = async (formData) => {
  try {
    if (editingDiscount.value) {
      await updateDiscount(editingDiscount.value.id, formData)
    } else {
      await createDiscount(formData)
    }
    showDiscountModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving discount:', error)
    alert('Gagal menyimpan diskon')
  }
}

const confirmDeleteDiscount = async (disc) => {
  if (confirm(`Hapus diskon "${disc.code}"?`)) {
    try {
      await deleteDiscount(disc.id)
      fetchData()
    } catch (error) {
      alert('Gagal menghapus diskon')
    }
  }
}

// ========== FLASH SALE FUNCTIONS ==========
const openAddFlashSale = () => {
  editingFlashSale.value = null
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  flashSaleForm.value = {
    title: '', description: '', productId: products.value[0]?.id || '', variantId: '',
    discountPercent: 10, startDate: now.toISOString().slice(0, 16), endDate: tomorrow.toISOString().slice(0, 16), isActive: true
  }
  showFlashSaleModal.value = true
}

const openEditFlashSale = (fs) => {
  editingFlashSale.value = fs
  flashSaleForm.value = {
    title: fs.title, description: fs.description || '', productId: fs.productId, variantId: fs.variantId || '',
    discountPercent: fs.discountPercent, startDate: fs.startDate ? fs.startDate.slice(0, 16) : '',
    endDate: fs.endDate ? fs.endDate.slice(0, 16) : '', isActive: fs.isActive === 1
  }
  showFlashSaleModal.value = true
}

const saveFlashSale = async (formData) => {
  try {
    const data = { ...formData, productId: parseInt(formData.productId), variantId: formData.variantId ? parseInt(formData.variantId) : null }
    if (editingFlashSale.value) {
      await updateFlashSale(editingFlashSale.value.id, data)
    } else {
      await createFlashSale(data)
    }
    showFlashSaleModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving flash sale:', error)
    alert('Gagal menyimpan flash sale')
  }
}

const confirmDeleteFlashSale = async (fs) => {
  if (confirm(`Hapus flash sale "${fs.title}"?`)) {
    try {
      await deleteFlashSale(fs.id)
      fetchData()
    } catch (error) {
      alert('Gagal menghapus flash sale')
    }
  }
}

// ========== TESTIMONIAL FUNCTIONS ==========
const approveTestimonial = async (testi) => {
  try {
    await updateTestimonial(testi.id, { isApproved: true })
    fetchData()
  } catch (error) {
    alert('Gagal menyetujui testimoni')
  }
}

const rejectTestimonial = async (testi) => {
  try {
    await updateTestimonial(testi.id, { isApproved: false })
    fetchData()
  } catch (error) {
    alert('Gagal menolak testimoni')
  }
}

const confirmDeleteTestimonial = async (testi) => {
  if (confirm('Hapus testimoni ini?')) {
    try {
      await deleteTestimonial(testi.id)
      fetchData()
    } catch (error) {
      alert('Gagal menghapus testimoni')
    }
  }
}

// ========== ARTICLE FUNCTIONS ==========
const openAddArticle = () => {
  editingArticle.value = null
  articleForm.value = { title: '', slug: '', content: '', image: '', isPublished: false }
  showArticleModal.value = true
}

const openEditArticle = (art) => {
  editingArticle.value = art
  articleForm.value = { title: art.title, slug: art.slug, content: art.content, image: art.image || '', isPublished: art.isPublished === 1 }
  showArticleModal.value = true
}

const saveArticle = async (formData) => {
  try {
    if (editingArticle.value) {
      await updateArticle(editingArticle.value.id, formData)
    } else {
      await createArticle(formData)
    }
    showArticleModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving article:', error)
    alert('Gagal menyimpan artikel')
  }
}

const confirmDeleteArticle = async (art) => {
  if (confirm(`Hapus artikel "${art.title}"?`)) {
    try {
      await deleteArticle(art.id)
      fetchData()
    } catch (error) {
      alert('Gagal menghapus artikel')
    }
  }
}

// ========== SETTINGS & CREDENTIALS ==========
const openSettings = () => {
  settingsForm.value = { ...settings.value }
  showSettingsModal.value = true
}

const saveSettings = async (formData) => {
  try {
    await updateSettings(formData)
    showSettingsModal.value = false
    fetchData()
  } catch (error) {
    alert('Gagal menyimpan pengaturan')
  }
}

const openCredentials = () => {
  credentialsForm.value = { currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' }
  credentialsError.value = ''
  showCredentialsModal.value = true
}

const saveCredentials = async (formData) => {
  credentialsError.value = ''
  if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
    credentialsError.value = 'Password baru tidak cocok'
    return
  }
  try {
    await updateAdminCredentials(formData)
    showCredentialsModal.value = false
    alert('Kredensial berhasil diupdate')
  } catch (error) {
    credentialsError.value = error.response?.data?.error || 'Gagal mengupdate kredensial'
  }
}

// Image upload handler
const handleImageUpload = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await uploadImage(formData)
  return res.data.url
}

// ========== ORDER FUNCTIONS ==========
const viewOrderDetail = (order) => {
  selectedOrder.value = order
  showOrderDetailModal.value = true
}

const handleUpdateOrderStatus = async (order, newStatus) => {
  try {
    await updateOrderStatus(order.id, newStatus)
    fetchData()
  } catch (error) {
    alert('Gagal mengupdate status pesanan')
  }
}

const confirmDeleteOrder = async (order) => {
  if (confirm(`Hapus pesanan "${order.orderCode}"?`)) {
    try {
      await deleteOrder(order.id)
      fetchData()
    } catch (error) {
      alert('Gagal menghapus pesanan')
    }
  }
}

// ========== ADMIN USER FUNCTIONS ==========
const openAddAdminUser = () => {
  editingAdminUser.value = null
  adminUserForm.value = { username: '', password: '', name: '', email: '', role: 'ADMIN', permissions: [] }
  adminUserError.value = ''
  showAdminUserModal.value = true
}

const openEditAdminUser = (user) => {
  editingAdminUser.value = user
  adminUserForm.value = { 
    username: user.username, 
    password: '', 
    name: user.name, 
    email: user.email || '', 
    role: user.role, 
    permissions: user.permissions || [] 
  }
  adminUserError.value = ''
  showAdminUserModal.value = true
}

const saveAdminUser = async (formData) => {
  adminUserError.value = ''
  try {
    if (editingAdminUser.value) {
      // Don't send password if empty
      const updateData = { ...formData }
      if (!updateData.password) {
        delete updateData.password
      }
      await updateAdminUser(editingAdminUser.value.id, updateData)
    } else {
      await createAdminUser(formData)
    }
    showAdminUserModal.value = false
    fetchData()
  } catch (error) {
    adminUserError.value = error.response?.data?.error || 'Gagal menyimpan admin user'
  }
}

const confirmDeleteAdminUser = async (user) => {
  if (confirm(`Nonaktifkan admin "${user.username}"?`)) {
    try {
      await deleteAdminUser(user.id)
      fetchData()
    } catch (error) {
      alert('Gagal menonaktifkan admin user')
    }
  }
}

const confirmRestoreAdminUser = async (user) => {
  if (confirm(`Aktivkan kembali admin "${user.username}"?`)) {
    try {
      await restoreAdminUser(user.id)
      fetchData()
    } catch (error) {
      alert('Gagal mengaktifkan admin user')
    }
  }
}
</script>

<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <AdminHeader 
      :admin-name="adminName"
      @open-credentials="openCredentials"
      @open-settings="openSettings"
      @logout="logout"
    />

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <template v-else>
      <!-- Tabs -->
      <AdminTabs 
        v-model:active-tab="activeTab"
        :tabs="tabs"
      />

      <!-- Main Content -->
      <main class="admin-main">
        <!-- Orders Tab -->
        <OrdersTab 
          v-if="activeTab === 'orders'"
          :orders="orders"
          :analytics="orderAnalytics"
          v-model:current-page="pageOrders"
          :items-per-page="itemsPerPage"
          @view="viewOrderDetail"
          @updateStatus="handleUpdateOrderStatus"
          @delete="confirmDeleteOrder"
        />

        <!-- Products Tab -->
        <ProductsTab 
          v-if="activeTab === 'products'"
          :products="products"
          v-model:current-page="pageProducts"
          :items-per-page="itemsPerPage"
          @add="openAddProduct"
          @edit="openEditProduct"
          @delete="confirmDeleteProduct"
        />

        <!-- Categories Tab -->
        <CategoriesTab 
          v-if="activeTab === 'categories'"
          :categories="categories"
          v-model:current-page="pageCategories"
          :items-per-page="itemsPerPage"
          @add="openAddCategory"
          @edit="openEditCategory"
          @delete="confirmDeleteCategory"
        />

        <!-- Payments Tab -->
        <PaymentsTab 
          v-if="activeTab === 'payments'"
          :payment-methods="paymentMethods"
          v-model:current-page="pagePayments"
          :items-per-page="itemsPerPage"
          @add="openAddPayment"
          @edit="openEditPayment"
          @delete="confirmDeletePayment"
        />

        <!-- Discounts Tab -->
        <DiscountsTab 
          v-if="activeTab === 'discounts'"
          :discounts="discounts"
          v-model:current-page="pageDiscounts"
          :items-per-page="itemsPerPage"
          @add="openAddDiscount"
          @edit="openEditDiscount"
          @delete="confirmDeleteDiscount"
        />

        <!-- Flash Sales Tab -->
        <FlashSalesTab 
          v-if="activeTab === 'flashsales'"
          :flash-sales="flashSales"
          v-model:current-page="pageFlashSales"
          :items-per-page="itemsPerPage"
          @add="openAddFlashSale"
          @edit="openEditFlashSale"
          @delete="confirmDeleteFlashSale"
        />

        <!-- Testimonials Tab -->
        <TestimonialsTab 
          v-if="activeTab === 'testimonials'"
          :testimonials="testimonials"
          v-model:current-page="pageTestimonials"
          :items-per-page="itemsPerPage"
          @approve="approveTestimonial"
          @reject="rejectTestimonial"
          @delete="confirmDeleteTestimonial"
        />

        <!-- Articles Tab -->
        <ArticlesTab 
          v-if="activeTab === 'articles'"
          :articles="articles"
          v-model:current-page="pageArticles"
          :items-per-page="itemsPerPage"
          @add="openAddArticle"
          @edit="openEditArticle"
          @delete="confirmDeleteArticle"
        />

        <!-- Admin Users Tab -->
        <AdminUsersTab 
          v-if="activeTab === 'adminusers'"
          :users="adminUsers"
          @add="openAddAdminUser"
          @edit="openEditAdminUser"
          @delete="confirmDeleteAdminUser"
          @restore="confirmRestoreAdminUser"
        />
      </main>
    </template>

    <!-- Modals -->
    <ProductModal 
      v-if="showProductModal"
      v-model="productForm"
      :editing="!!editingProduct"
      :categories="categories"
      :upload-handler="handleImageUpload"
      @close="showProductModal = false"
      @save="saveProduct"
    />

    <FlashSaleModal 
      v-if="showFlashSaleModal"
      v-model="flashSaleForm"
      :editing="!!editingFlashSale"
      :products="products"
      @close="showFlashSaleModal = false"
      @save="saveFlashSale"
    />

    <CategoryModal 
      v-if="showCategoryModal"
      v-model="categoryForm"
      :editing="!!editingCategory"
      @close="showCategoryModal = false"
      @save="saveCategory"
    />

    <PaymentModal 
      v-if="showPaymentModal"
      v-model="paymentForm"
      :editing="!!editingPayment"
      :upload-handler="handleImageUpload"
      @close="showPaymentModal = false"
      @save="savePayment"
    />

    <DiscountModal 
      v-if="showDiscountModal"
      v-model="discountForm"
      :editing="!!editingDiscount"
      :products="products"
      @close="showDiscountModal = false"
      @save="saveDiscount"
    />

    <ArticleModal 
      v-if="showArticleModal"
      v-model="articleForm"
      :editing="!!editingArticle"
      @close="showArticleModal = false"
      @save="saveArticle"
    />

    <SettingsModal 
      v-if="showSettingsModal"
      v-model="settingsForm"
      @close="showSettingsModal = false"
      @save="saveSettings"
    />

    <CredentialsModal 
      v-if="showCredentialsModal"
      v-model="credentialsForm"
      :error="credentialsError"
      @close="showCredentialsModal = false"
      @save="saveCredentials"
    />

    <OrderDetailModal 
      v-if="showOrderDetailModal && selectedOrder"
      :order="selectedOrder"
      @close="showOrderDetailModal = false"
    />

    <AdminUserModal 
      v-if="showAdminUserModal"
      :show="showAdminUserModal"
      v-model="adminUserForm"
      :editing="!!editingAdminUser"
      :loading="false"
      :error="adminUserError"
      @close="showAdminUserModal = false"
      @submit="saveAdminUser"
    />
  </div>
</template>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f3f4f6;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 15px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.admin-main {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
