<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getProducts, getSettings, createProduct, updateProduct, deleteProduct, updateSettings,
  getAdminCategories, createCategory, updateCategory, deleteCategory,
  getAdminPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  getAdminDiscounts, createDiscount, updateDiscount, deleteDiscount,
  uploadImage, updateAdminCredentials
} from '../services/api'

const router = useRouter()
const admin = ref(null)
const products = ref([])
const categories = ref([])
const paymentMethods = ref([])
const discounts = ref([])
const settings = ref({})
const activeTab = ref('products')

// Modals
const showProductModal = ref(false)
const showCategoryModal = ref(false)
const showPaymentModal = ref(false)
const showDiscountModal = ref(false)
const showSettingsModal = ref(false)

// Editing states
const editingProduct = ref(null)
const editingCategory = ref(null)
const editingPayment = ref(null)
const editingDiscount = ref(null)

// Product Form
const productForm = ref({
  name: '',
  slug: '',
  description: '',
  image: '',
  badge: '',
  categoryId: '',
  isActive: true,
  variants: [{ name: '', price: 0, originalPrice: 0, isWarranty: false }]
})

// Category Form
const categoryForm = ref({ name: '', slug: '' })

// Payment Form
const paymentForm = ref({ 
  name: '', 
  icon: '💳', 
  iconType: 'emoji',
  accountInfo: '', 
  feeType: 'fixed', 
  fees: 0, 
  currency: 'IDR',
  qrisImage: '',
  isActive: true 
})

// Discount Form
const discountForm = ref({
  code: '',
  name: '',
  type: 'fixed',
  value: 0,
  maxDiscount: null,
  minPurchase: null,
  applyTo: 'all',
  productIds: [],
  usageLimit: null,
  expiresAt: '',
  isActive: true
})

// Settings Form
const settingsForm = ref({
  store_name: '',
  store_tagline: '',
  whatsapp_number: '',
  whatsapp_message_template: ''
})

// Credentials Form
const showCredentialsModal = ref(false)
const credentialsForm = ref({
  currentPassword: '',
  newUsername: '',
  newPassword: '',
  confirmPassword: '',
  newName: ''
})
const credentialsError = ref('')
const credentialsSaving = ref(false)

// Image upload
const uploading = ref(false)
const imageFile = ref(null)

const checkAuth = () => {
  const token = localStorage.getItem('admin_token')
  const user = localStorage.getItem('admin_user')
  if (!token || !user) {
    router.push('/admin')
    return false
  }
  admin.value = JSON.parse(user)
  return true
}

const fetchData = async () => {
  try {
    const [prodRes, catRes, pmRes, discRes, settingsRes] = await Promise.all([
      getProducts(),
      getAdminCategories(),
      getAdminPaymentMethods(),
      getAdminDiscounts(),
      getSettings()
    ])
    products.value = prodRes.data
    categories.value = catRes.data
    paymentMethods.value = pmRes.data
    discounts.value = discRes.data
    settings.value = settingsRes.data
    settingsForm.value = { ...settingsRes.data }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const logout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/admin')
}

// ========== PRODUCT FUNCTIONS ==========
const openAddProduct = () => {
  editingProduct.value = null
  productForm.value = {
    name: '', slug: '', description: '', image: '', badge: '',
    categoryId: categories.value[0]?.id || '',
    isActive: true,
    variants: [{ name: '', price: 0, originalPrice: 0, isWarranty: false, isActive: true }]
  }
  imageFile.value = null
  showProductModal.value = true
}

const openEditProduct = (product) => {
  editingProduct.value = product
  productForm.value = {
    name: product.name, slug: product.slug, description: product.description,
    image: product.image, badge: product.badge || '', categoryId: product.categoryId,
    isActive: product.isActive !== false,
    variants: product.variants.map(v => ({ name: v.name, price: v.price, originalPrice: v.originalPrice, isWarranty: v.isWarranty, isActive: v.isActive !== false }))
  }
  imageFile.value = null
  showProductModal.value = true
}

const addVariant = () => {
  productForm.value.variants.push({ name: '', price: 0, originalPrice: 0, isWarranty: false, isActive: true })
}

const removeVariant = (index) => {
  if (productForm.value.variants.length > 1) {
    productForm.value.variants.splice(index, 1)
  }
}

const generateSlug = () => {
  productForm.value.slug = productForm.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  uploading.value = true
  try {
    const res = await uploadImage(file)
    productForm.value.image = res.data.url
  } catch (error) {
    console.error('Upload error:', error)
    alert('Gagal upload gambar')
  } finally {
    uploading.value = false
  }
}

const saveProduct = async () => {
  try {
    const data = { ...productForm.value, categoryId: parseInt(productForm.value.categoryId) }
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
      console.error('Error deleting product:', error)
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

const generateCategorySlug = () => {
  categoryForm.value.slug = categoryForm.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, categoryForm.value)
    } else {
      await createCategory(categoryForm.value)
    }
    showCategoryModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving category:', error)
    alert(error.response?.data?.error || 'Gagal menyimpan kategori')
  }
}

const confirmDeleteCategory = async (cat) => {
  if (confirm(`Hapus kategori "${cat.name}"?`)) {
    try {
      await deleteCategory(cat.id)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal menghapus kategori')
    }
  }
}

// ========== PAYMENT METHOD FUNCTIONS ==========
const openAddPayment = () => {
  editingPayment.value = null
  paymentForm.value = { 
    name: '', 
    icon: '💳', 
    iconType: 'emoji',
    accountInfo: '', 
    feeType: 'fixed', 
    fees: 0, 
    currency: 'IDR',
    qrisImage: '',
    isActive: true 
  }
  showPaymentModal.value = true
}

const openEditPayment = (pm) => {
  editingPayment.value = pm
  paymentForm.value = { 
    name: pm.name, 
    icon: pm.icon || '💳', 
    iconType: pm.iconType || 'emoji',
    accountInfo: pm.accountInfo || '', 
    feeType: pm.feeType || 'fixed', 
    fees: pm.fees || 0, 
    currency: pm.currency || 'IDR',
    qrisImage: pm.qrisImage || '',
    isActive: pm.isActive === 1 
  }
  showPaymentModal.value = true
}

const handlePaymentIconUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  uploading.value = true
  try {
    const res = await uploadImage(file)
    paymentForm.value.icon = res.data.url
  } catch (error) {
    console.error('Upload error:', error)
    alert('Gagal upload gambar')
  } finally {
    uploading.value = false
  }
}

const handleQrisUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  uploading.value = true
  try {
    const res = await uploadImage(file)
    paymentForm.value.qrisImage = res.data.url
  } catch (error) {
    console.error('Upload error:', error)
    alert('Gagal upload gambar QRIS')
  } finally {
    uploading.value = false
  }
}

const savePayment = async () => {
  try {
    if (editingPayment.value) {
      await updatePaymentMethod(editingPayment.value.id, paymentForm.value)
    } else {
      await createPaymentMethod(paymentForm.value)
    }
    showPaymentModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving payment method:', error)
    alert('Gagal menyimpan metode pembayaran')
  }
}

const confirmDeletePayment = async (pm) => {
  if (confirm(`Hapus metode pembayaran "${pm.name}"?`)) {
    try {
      await deletePaymentMethod(pm.id)
      fetchData()
    } catch (error) {
      console.error('Error deleting payment:', error)
    }
  }
}

// ========== DISCOUNT FUNCTIONS ==========
const openAddDiscount = () => {
  editingDiscount.value = null
  discountForm.value = {
    code: '',
    name: '',
    type: 'fixed',
    value: 0,
    maxDiscount: null,
    minPurchase: null,
    applyTo: 'all',
    productIds: [],
    usageLimit: null,
    expiresAt: '',
    isActive: true
  }
  showDiscountModal.value = true
}

const openEditDiscount = (disc) => {
  editingDiscount.value = disc
  let productIds = []
  if (disc.productIds) {
    try {
      productIds = JSON.parse(disc.productIds)
    } catch (e) {
      productIds = []
    }
  }
  discountForm.value = {
    code: disc.code,
    name: disc.name,
    type: disc.type || 'fixed',
    value: disc.value,
    maxDiscount: disc.maxDiscount,
    minPurchase: disc.minPurchase,
    applyTo: disc.applyTo || 'all',
    productIds: productIds,
    usageLimit: disc.usageLimit,
    expiresAt: disc.expiresAt ? disc.expiresAt.slice(0, 16) : '',
    isActive: disc.isActive === 1
  }
  showDiscountModal.value = true
}

const toggleProductSelection = (productId) => {
  const idx = discountForm.value.productIds.indexOf(productId)
  if (idx === -1) {
    discountForm.value.productIds.push(productId)
  } else {
    discountForm.value.productIds.splice(idx, 1)
  }
}

const saveDiscount = async () => {
  try {
    const data = { 
      ...discountForm.value,
      expiresAt: discountForm.value.expiresAt || null
    }
    if (editingDiscount.value) {
      await updateDiscount(editingDiscount.value.id, data)
    } else {
      await createDiscount(data)
    }
    showDiscountModal.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving discount:', error)
    alert(error.response?.data?.error || 'Gagal menyimpan diskon')
  }
}

const confirmDeleteDiscount = async (disc) => {
  if (confirm(`Hapus diskon "${disc.code}"?`)) {
    try {
      await deleteDiscount(disc.id)
      fetchData()
    } catch (error) {
      console.error('Error deleting discount:', error)
    }
  }
}

// ========== SETTINGS ==========
const saveSettings = async () => {
  try {
    await updateSettings(settingsForm.value)
    settings.value = { ...settingsForm.value }
    showSettingsModal.value = false
    alert('Settings berhasil disimpan!')
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Gagal menyimpan settings')
  }
}

// ========== CREDENTIALS ==========
const openCredentialsModal = () => {
  credentialsForm.value = {
    currentPassword: '',
    newUsername: admin.value?.username || '',
    newPassword: '',
    confirmPassword: '',
    newName: admin.value?.name || ''
  }
  credentialsError.value = ''
  showCredentialsModal.value = true
}

const saveCredentials = async () => {
  credentialsError.value = ''
  
  // Validate
  if (!credentialsForm.value.currentPassword) {
    credentialsError.value = 'Password saat ini wajib diisi'
    return
  }
  
  if (credentialsForm.value.newPassword && credentialsForm.value.newPassword !== credentialsForm.value.confirmPassword) {
    credentialsError.value = 'Konfirmasi password tidak cocok'
    return
  }
  
  credentialsSaving.value = true
  try {
    await updateAdminCredentials({
      currentPassword: credentialsForm.value.currentPassword,
      newUsername: credentialsForm.value.newUsername || null,
      newPassword: credentialsForm.value.newPassword || null,
      newName: credentialsForm.value.newName || null
    })
    
    // Update local admin info
    if (credentialsForm.value.newUsername) {
      admin.value.username = credentialsForm.value.newUsername
    }
    if (credentialsForm.value.newName) {
      admin.value.name = credentialsForm.value.newName
      localStorage.setItem('admin_user', JSON.stringify(admin.value))
    }
    
    showCredentialsModal.value = false
    alert('Kredensial berhasil diupdate!')
    
    // If password changed, force re-login
    if (credentialsForm.value.newPassword) {
      alert('Password berubah, silakan login ulang.')
      logout()
    }
  } catch (error) {
    credentialsError.value = error.response?.data?.error || 'Gagal mengupdate kredensial'
  } finally {
    credentialsSaving.value = false
  }
}

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)

onMounted(() => {
  if (checkAuth()) fetchData()
})
</script>

<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-left">
        <h1>📊 Admin Dashboard</h1>
        <span>Selamat datang, {{ admin?.name }}</span>
      </div>
      <div class="header-right">
        <button class="btn btn-outline" @click="openCredentialsModal">🔐 Ubah Password</button>
        <button class="btn btn-secondary" @click="showSettingsModal = true">⚙️ Settings</button>
        <button class="btn btn-danger" @click="logout">Logout</button>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'products' }]" @click="activeTab = 'products'">
          📦 Produk ({{ products.length }})
        </button>
        <button :class="['tab', { active: activeTab === 'categories' }]" @click="activeTab = 'categories'">
          📁 Kategori ({{ categories.length }})
        </button>
        <button :class="['tab', { active: activeTab === 'payments' }]" @click="activeTab = 'payments'">
          💳 Pembayaran ({{ paymentMethods.length }})
        </button>
        <button :class="['tab', { active: activeTab === 'discounts' }]" @click="activeTab = 'discounts'">
          🏷️ Diskon ({{ discounts.length }})
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Products Tab -->
      <div v-if="activeTab === 'products'">
        <div class="section-header">
          <h2>Daftar Produk</h2>
          <button class="btn btn-primary" @click="openAddProduct">+ Tambah Produk</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Varian</th>
                <th>Badge</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td><img :src="product.image" class="thumb" /></td>
                <td><strong>{{ product.name }}</strong><br><small>{{ product.slug }}</small></td>
                <td>{{ product.category?.name }}</td>
                <td>
                  <div v-for="v in product.variants" :key="v.id" class="variant-row">
                    {{ v.name }}: <strong>Rp {{ formatPrice(v.price) }}</strong>
                  </div>
                </td>
                <td><span v-if="product.badge" class="badge">{{ product.badge }}</span><span v-else>-</span></td>
                <td>
                  <button class="btn btn-sm btn-edit" @click="openEditProduct(product)">✏️</button>
                  <button class="btn btn-sm btn-delete" @click="confirmDeleteProduct(product)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Categories Tab -->
      <div v-if="activeTab === 'categories'">
        <div class="section-header">
          <h2>Daftar Kategori</h2>
          <button class="btn btn-primary" @click="openAddCategory">+ Tambah Kategori</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Nama</th><th>Slug</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td>{{ cat.id }}</td>
                <td><strong>{{ cat.name }}</strong></td>
                <td>{{ cat.slug }}</td>
                <td>
                  <button class="btn btn-sm btn-edit" @click="openEditCategory(cat)">✏️</button>
                  <button class="btn btn-sm btn-delete" @click="confirmDeleteCategory(cat)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Methods Tab -->
      <div v-if="activeTab === 'payments'">
        <div class="section-header">
          <h2>Metode Pembayaran</h2>
          <button class="btn btn-primary" @click="openAddPayment">+ Tambah Metode</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Icon</th><th>Nama</th><th>Info Rekening</th><th>Fees</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr v-for="pm in paymentMethods" :key="pm.id">
                <td style="font-size: 1.5rem;">
                  <img v-if="pm.iconType === 'image' && pm.icon" :src="pm.icon" class="payment-icon-img" />
                  <span v-else>{{ pm.icon }}</span>
                </td>
                <td><strong>{{ pm.name }}</strong></td>
                <td style="white-space: pre-wrap; max-width: 200px;">{{ pm.accountInfo || '-' }}</td>
                <td>{{ pm.fees > 0 ? (pm.feeType === 'percent' ? pm.fees + '%' : 'Rp ' + formatPrice(pm.fees)) : '-' }}</td>
                <td><span :class="['status', pm.isActive ? 'active' : 'inactive']">{{ pm.isActive ? 'Aktif' : 'Nonaktif' }}</span></td>
                <td>
                  <button class="btn btn-sm btn-edit" @click="openEditPayment(pm)">✏️</button>
                  <button class="btn btn-sm btn-delete" @click="confirmDeletePayment(pm)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Discounts Tab -->
      <div v-if="activeTab === 'discounts'">
        <div class="section-header">
          <h2>Daftar Diskon</h2>
          <button class="btn btn-primary" @click="openAddDiscount">+ Tambah Diskon</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Nilai</th>
                <th>Berlaku</th>
                <th>Terpakai</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="disc in discounts" :key="disc.id">
                <td><strong>{{ disc.code }}</strong></td>
                <td>{{ disc.name }}</td>
                <td>{{ disc.type === 'percent' ? 'Persen' : 'Fixed' }}</td>
                <td>{{ disc.type === 'percent' ? disc.value + '%' : 'Rp ' + formatPrice(disc.value) }}<span v-if="disc.maxDiscount"><br><small>Max: Rp {{ formatPrice(disc.maxDiscount) }}</small></span></td>
                <td>{{ disc.applyTo === 'all' ? 'Semua Produk' : 'Produk Tertentu' }}</td>
                <td>
                  <span v-if="disc.usageLimit">{{ disc.usageCount || 0 }}/{{ disc.usageLimit }}</span>
                  <span v-else>{{ disc.usageCount || 0 }} (unlimited)</span>
                </td>
                <td>
                  <span v-if="disc.usageLimit && disc.usageCount >= disc.usageLimit" class="status promo-habis">🔥 Promo Habis</span>
                  <span v-else :class="['status', disc.isActive ? 'active' : 'inactive']">{{ disc.isActive ? 'Aktif' : 'Nonaktif' }}</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-edit" @click="openEditDiscount(disc)">✏️</button>
                  <button class="btn btn-sm btn-delete" @click="confirmDeleteDiscount(disc)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Product Modal -->
    <div v-if="showProductModal" class="modal-overlay" @click.self="showProductModal = false">
      <div class="modal admin-modal">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Edit Produk' : 'Tambah Produk' }}</h3>
          <button class="modal-close" @click="showProductModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group"><label>Nama Produk</label><input v-model="productForm.name" @input="generateSlug" /></div>
            <div class="form-group"><label>Slug</label><input v-model="productForm.slug" /></div>
          </div>
          <div class="form-group"><label>Deskripsi</label><textarea v-model="productForm.description" rows="3"></textarea></div>
          
          <!-- Image Upload -->
          <div class="form-group">
            <label>Gambar (URL atau Upload)</label>
            <div class="image-upload-group">
              <input v-model="productForm.image" placeholder="https://... atau upload file" />
              <label class="upload-btn">
                {{ uploading ? '⏳' : '📁' }} Upload
                <input type="file" accept="image/*" @change="handleImageUpload" hidden />
              </label>
            </div>
            <img v-if="productForm.image" :src="productForm.image" class="preview-image" />
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Badge</label>
              <div class="toggle-group">
                <button type="button" :class="['toggle-btn', { active: !productForm.badge }]" @click="productForm.badge = ''">
                  Tidak Ada
                </button>
                <button type="button" :class="['toggle-btn', { active: productForm.badge === 'Terlaris' }]" @click="productForm.badge = 'Terlaris'">
                  🔥 Terlaris
                </button>
                <button type="button" :class="['toggle-btn', { active: productForm.badge === 'Proses Instant' }]" @click="productForm.badge = 'Proses Instant'">
                  ⚡ Proses Instant
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Kategori</label>
              <select v-model="productForm.categoryId">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>
          <div class="variants-section">
            <div class="variants-header"><label>Varian</label><button type="button" class="btn btn-sm btn-secondary" @click="addVariant">+ Tambah</button></div>
            <div v-for="(v, i) in productForm.variants" :key="i" class="variant-form">
              <input v-model="v.name" placeholder="Nama" /><input v-model.number="v.price" type="number" placeholder="Harga" />
              <input v-model.number="v.originalPrice" type="number" placeholder="Harga Asli" />
              <label class="checkbox-label"><input type="checkbox" v-model="v.isWarranty" /> Garansi</label>
              <label class="checkbox-label" :class="{ 'stock-out': !v.isActive }"><input type="checkbox" v-model="v.isActive" /> {{ v.isActive ? 'Ready' : 'Habis' }}</label>
              <button v-if="productForm.variants.length > 1" type="button" class="btn btn-sm btn-delete" @click="removeVariant(i)">×</button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Status Produk</label>
            <div class="toggle-group">
              <button type="button" :class="['toggle-btn', { active: productForm.isActive }]" @click="productForm.isActive = true">
                ✓ Tersedia
              </button>
              <button type="button" :class="['toggle-btn', { active: !productForm.isActive }]" @click="productForm.isActive = false">
                ✕ Habis
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-secondary" @click="showProductModal = false">Batal</button><button class="btn btn-primary" @click="saveProduct">Simpan</button></div>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
      <div class="modal admin-modal small-modal">
        <div class="modal-header"><h3>{{ editingCategory ? 'Edit' : 'Tambah' }} Kategori</h3><button class="modal-close" @click="showCategoryModal = false">×</button></div>
        <div class="modal-body">
          <div class="form-group"><label>Nama</label><input v-model="categoryForm.name" @input="generateCategorySlug" /></div>
          <div class="form-group"><label>Slug</label><input v-model="categoryForm.slug" /></div>
        </div>
        <div class="modal-footer"><button class="btn btn-secondary" @click="showCategoryModal = false">Batal</button><button class="btn btn-primary" @click="saveCategory">Simpan</button></div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="modal admin-modal">
        <div class="modal-header"><h3>{{ editingPayment ? 'Edit' : 'Tambah' }} Metode Pembayaran</h3><button class="modal-close" @click="showPaymentModal = false">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nama</label>
              <input v-model="paymentForm.name" placeholder="Gopay, OVO, BCA, dll" />
              <small>Nama metode pembayaran</small>
            </div>
            <div class="form-group">
              <label>Tipe Icon</label>
              <select v-model="paymentForm.iconType">
                <option value="emoji">Emoji</option>
                <option value="image">Gambar/Logo</option>
              </select>
            </div>
          </div>
          
          <div class="form-group" v-if="paymentForm.iconType === 'emoji'">
            <label>Icon (Emoji)</label>
            <input v-model="paymentForm.icon" placeholder="💳" />
          </div>
          
          <div class="form-group" v-if="paymentForm.iconType === 'image'">
            <label>Logo/Gambar</label>
            <div class="image-upload-group">
              <input v-model="paymentForm.icon" placeholder="https://... atau upload file" />
              <label class="upload-btn">
                {{ uploading ? '⏳' : '📁' }} Upload
                <input type="file" accept="image/*" @change="handlePaymentIconUpload" hidden />
              </label>
            </div>
            <img v-if="paymentForm.icon" :src="paymentForm.icon" class="preview-image" />
          </div>
          
          <div class="form-group">
            <label>Informasi Rekening</label>
            <textarea v-model="paymentForm.accountInfo" rows="3" placeholder="Nomor rekening, pisahkan dengan enter"></textarea>
            <small>Support multi line, pisahkan dengan enter</small>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Tipe Fees</label>
              <select v-model="paymentForm.feeType">
                <option value="fixed">Fixed (Nominal)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fees</label>
              <input v-model.number="paymentForm.fees" type="number" placeholder="0" />
              <small>Kosongkan atau 0 untuk tanpa fees</small>
            </div>
          </div>
          
          <div class="form-group">
            <label>Gambar QRIS (Opsional)</label>
            <div class="image-upload-group">
              <input v-model="paymentForm.qrisImage" placeholder="https://... atau upload QRIS" />
              <label class="upload-btn">
                {{ uploading ? '⏳' : '📁' }} Upload
                <input type="file" accept="image/*" @change="handleQrisUpload" hidden />
              </label>
            </div>
            <img v-if="paymentForm.qrisImage" :src="paymentForm.qrisImage" class="preview-image qris-preview" />
            <small>Upload gambar QRIS jika metode ini menggunakan QRIS</small>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Currency</label>
              <select v-model="paymentForm.currency">
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (Dollar)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <div class="toggle-group">
                <button 
                  type="button"
                  :class="['toggle-btn', { active: paymentForm.isActive }]"
                  @click="paymentForm.isActive = true"
                >
                  ✓ Aktif
                </button>
                <button 
                  type="button"
                  :class="['toggle-btn', { active: !paymentForm.isActive }]"
                  @click="paymentForm.isActive = false"
                >
                  ✕ Nonaktif
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-secondary" @click="showPaymentModal = false">Batal</button><button class="btn btn-primary" @click="savePayment">Simpan</button></div>
      </div>
    </div>

    <!-- Discount Modal -->
    <div v-if="showDiscountModal" class="modal-overlay" @click.self="showDiscountModal = false">
      <div class="modal admin-modal large-modal">
        <div class="modal-header"><h3>{{ editingDiscount ? 'Edit' : 'Tambah' }} Diskon</h3><button class="modal-close" @click="showDiscountModal = false">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Kode Diskon</label>
              <input v-model="discountForm.code" placeholder="TAHUNBARU2026" style="text-transform: uppercase;" />
              <small>Kode yang diketik pembeli</small>
            </div>
            <div class="form-group">
              <label>Nama Diskon</label>
              <input v-model="discountForm.name" placeholder="Promo Tahun Baru" />
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Tipe Diskon</label>
              <select v-model="discountForm.type">
                <option value="fixed">Fixed (Rp)</option>
                <option value="percent">Persen (%)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nilai</label>
              <input v-model.number="discountForm.value" type="number" placeholder="10000" />
              <small>{{ discountForm.type === 'percent' ? 'Dalam persen (%)' : 'Dalam Rupiah (Rp)' }}</small>
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Max Diskon (untuk %)</label>
              <input v-model.number="discountForm.maxDiscount" type="number" placeholder="50000" />
              <small>Batas maksimal, kosongkan jika tidak ada</small>
            </div>
            <div class="form-group">
              <label>Min Pembelian</label>
              <input v-model.number="discountForm.minPurchase" type="number" placeholder="100000" />
              <small>Minimal pembelian, kosongkan jika tidak ada</small>
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Berlaku Untuk</label>
              <select v-model="discountForm.applyTo">
                <option value="all">Semua Produk</option>
                <option value="products">Produk Tertentu</option>
              </select>
            </div>
            <div class="form-group">
              <label>Berlaku Sampai</label>
              <input v-model="discountForm.expiresAt" type="datetime-local" />
              <small>Kosongkan jika tidak ada batas waktu</small>
            </div>
          </div>
          
          <div v-if="discountForm.applyTo === 'products'" class="form-group">
            <label>Pilih Produk</label>
            <div class="product-selection">
              <div v-for="prod in products" :key="prod.id" 
                   :class="['product-chip', { selected: discountForm.productIds.includes(prod.id) }]"
                   @click="toggleProductSelection(prod.id)">
                <img :src="prod.image" class="product-chip-img" />
                {{ prod.name }}
              </div>
            </div>
            <small>Klik untuk memilih/batal pilih produk</small>
          </div>
          
          <div class="form-group">
            <label>Batas Penggunaan</label>
            <input v-model.number="discountForm.usageLimit" type="number" placeholder="Kosongkan untuk unlimited" min="1" />
            <small>Misal: 5 berarti hanya untuk 5 orang pertama, lalu promo habis</small>
          </div>
          
          <div class="form-group">
            <label>Status</label>
            <div class="toggle-group">
              <button 
                type="button"
                :class="['toggle-btn', { active: discountForm.isActive }]"
                @click="discountForm.isActive = true"
              >
                ✓ Aktif
              </button>
              <button 
                type="button"
                :class="['toggle-btn', { active: !discountForm.isActive }]"
                @click="discountForm.isActive = false"
              >
                ✕ Nonaktif
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-secondary" @click="showDiscountModal = false">Batal</button><button class="btn btn-primary" @click="saveDiscount">Simpan</button></div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettingsModal" class="modal-overlay" @click.self="showSettingsModal = false">
      <div class="modal admin-modal">
        <div class="modal-header"><h3>⚙️ Store Settings</h3><button class="modal-close" @click="showSettingsModal = false">×</button></div>
        <div class="modal-body">
          <div class="form-group"><label>Nama Toko</label><input v-model="settingsForm.store_name" /></div>
          <div class="form-group"><label>Tagline</label><input v-model="settingsForm.store_tagline" /></div>
          <div class="form-group"><label>Nomor WhatsApp (tanpa +)</label><input v-model="settingsForm.whatsapp_number" placeholder="6281234567890" /></div>
          <div class="form-group"><label>Template Pesan WhatsApp</label><textarea v-model="settingsForm.whatsapp_message_template" rows="8"></textarea><small>Variabel: {product}, {variant}, {quantity}, {price}, {unique_code}, {total}, {payment}</small></div>
        </div>
        <div class="modal-footer"><button class="btn btn-secondary" @click="showSettingsModal = false">Batal</button><button class="btn btn-primary" @click="saveSettings">Simpan</button></div>
      </div>
    </div>

    <!-- Credentials Modal -->
    <div v-if="showCredentialsModal" class="modal-overlay" @click.self="showCredentialsModal = false">
      <div class="modal admin-modal">
        <div class="modal-header"><h3>🔐 Ubah Kredensial Admin</h3><button class="modal-close" @click="showCredentialsModal = false">×</button></div>
        <div class="modal-body">
          <div v-if="credentialsError" class="error-alert">{{ credentialsError }}</div>
          
          <div class="form-group">
            <label>Password Saat Ini *</label>
            <input v-model="credentialsForm.currentPassword" type="password" placeholder="Masukkan password saat ini" />
            <small>Wajib diisi untuk verifikasi</small>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          
          <div class="form-group">
            <label>Username Baru</label>
            <input v-model="credentialsForm.newUsername" placeholder="Username baru (opsional)" />
          </div>
          
          <div class="form-group">
            <label>Nama Tampilan</label>
            <input v-model="credentialsForm.newName" placeholder="Nama yang ditampilkan" />
          </div>
          
          <div class="form-group">
            <label>Password Baru</label>
            <input v-model="credentialsForm.newPassword" type="password" placeholder="Kosongkan jika tidak ingin mengubah" />
          </div>
          
          <div class="form-group">
            <label>Konfirmasi Password Baru</label>
            <input v-model="credentialsForm.confirmPassword" type="password" placeholder="Ketik ulang password baru" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCredentialsModal = false">Batal</button>
          <button class="btn btn-primary" @click="saveCredentials" :disabled="credentialsSaving">
            {{ credentialsSaving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard { min-height: 100vh; background: #f3f4f6; }
.admin-header { background: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.header-left h1 { font-size: 1.5rem; margin-bottom: 4px; }
.header-left span { color: #6b7280; font-size: 0.875rem; }
.header-right { display: flex; gap: 10px; }

.tabs-container { background: white; border-bottom: 1px solid #e5e7eb; }
.tabs { display: flex; max-width: 1400px; margin: 0 auto; padding: 0 30px; }
.tab { padding: 15px 25px; background: none; font-weight: 500; color: #6b7280; border-bottom: 3px solid transparent; transition: all 0.2s; }
.tab:hover { color: #374151; }
.tab.active { color: #3B82F6; border-bottom-color: #3B82F6; }

.admin-main { padding: 30px; max-width: 1400px; margin: 0 auto; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { font-size: 1.25rem; }

.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 0.875rem; transition: all 0.2s; cursor: pointer; }
.btn-primary { background: #3B82F6; color: white; }
.btn-primary:hover { background: #2563EB; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-danger { background: #EF4444; color: white; }
.btn-sm { padding: 6px 12px; font-size: 0.75rem; }
.btn-edit { background: #FEF3C7; }
.btn-delete { background: #FEE2E2; }

.table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 15px; text-align: left; border-bottom: 1px solid #e5e7eb; }
.data-table th { background: #f9fafb; font-weight: 600; font-size: 0.875rem; color: #6b7280; }
.thumb { width: 50px; height: 50px; object-fit: contain; border-radius: 8px; background: #f3f4f6; }
.variant-row { font-size: 0.875rem; margin-bottom: 4px; }
.badge { display: inline-block; padding: 4px 10px; background: #FEF3C7; color: #D97706; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
.status { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
.status.active { background: #D1FAE5; color: #059669; }
.status.inactive { background: #FEE2E2; color: #DC2626; }
.status.promo-habis { background: #FEF3C7; color: #D97706; }

.admin-modal { max-width: 600px; }
.small-modal { max-width: 400px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-weight: 500; margin-bottom: 6px; color: #374151; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3B82F6; outline: none; }
.form-group small { color: #6b7280; font-size: 0.75rem; }

.image-upload-group { display: flex; gap: 10px; }
.image-upload-group input { flex: 1; }
.upload-btn { display: inline-flex; align-items: center; gap: 5px; padding: 12px 20px; background: #e5e7eb; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.875rem; }
.upload-btn:hover { background: #d1d5db; }
.preview-image { max-width: 100px; max-height: 100px; margin-top: 10px; border-radius: 8px; object-fit: contain; background: #f3f4f6; }

.variants-section { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
.variants-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.variant-form { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
.variant-form input { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; }
.checkbox-label { display: flex; align-items: center; gap: 5px; font-size: 0.875rem; white-space: nowrap; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; }

.large-modal { max-width: 700px; }
.payment-icon-img { width: 40px; height: 40px; object-fit: contain; border-radius: 4px; }
.qris-preview { max-width: 150px; max-height: 200px; }

.product-selection { display: flex; flex-wrap: wrap; gap: 8px; max-height: 200px; overflow-y: auto; padding: 10px; background: #f9fafb; border-radius: 8px; }
.product-chip { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
.product-chip:hover { border-color: #3B82F6; }
.product-chip.selected { background: #EBF5FF; border-color: #3B82F6; color: #1D4ED8; }
.product-chip-img { width: 24px; height: 24px; border-radius: 4px; object-fit: contain; }

/* Toggle buttons */
.toggle-group { display: flex; gap: 8px; }
.toggle-btn { padding: 10px 18px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-weight: 500; background: white; transition: all 0.2s; cursor: pointer; }
.toggle-btn:hover { border-color: #3B82F6; }
.toggle-btn.active { background: #EBF5FF; border-color: #3B82F6; color: #1D4ED8; }

/* Outline button */
.btn-outline { background: white; border: 2px solid #3B82F6; color: #3B82F6; }
.btn-outline:hover { background: #EBF5FF; }

/* Error alert */
.error-alert { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 12px 15px; border-radius: 8px; margin-bottom: 15px; font-size: 0.875rem; }
</style>
