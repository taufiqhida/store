<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal admin-modal large-modal">
      <div class="modal-header">
        <h3>{{ editing ? 'Edit Produk' : 'Tambah Produk' }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Nama Produk</label>
            <input v-model="form.name" @input="generateSlug" />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input v-model="form.slug" />
          </div>
        </div>
        
        <div class="form-group">
          <label>URL Gambar</label>
          <div class="image-upload-group">
            <input v-model="form.image" placeholder="https://... atau upload gambar" />
            <label class="upload-btn">
              {{ uploading ? '⏳' : '📁' }} Upload
              <input type="file" accept="image/*" @change="handleImageUpload" hidden />
            </label>
          </div>
          <img v-if="form.image" :src="form.image" class="preview-image" />
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Kategori</label>
            <select v-model="form.categoryId">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Badge</label>
            <select v-model="form.badge">
              <option value="">Tidak Ada</option>
              <option value="Terlaris">🔥 Terlaris</option>
              <option value="Instant">⚡ Instant</option>
              <option value="Promo">💰 Promo</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea v-model="form.description" rows="3" placeholder="Deskripsi produk..."></textarea>
        </div>
        
        <!-- Variants Section -->
        <div class="form-group">
          <label>Varian Produk</label>
          <div v-for="(variant, index) in form.variants" :key="index" class="variant-row">
            <input v-model="variant.name" placeholder="Nama varian" class="variant-input" />
            <input v-model.number="variant.price" type="number" placeholder="Harga" class="variant-input" />
            <input v-model.number="variant.originalPrice" type="number" placeholder="Harga asli" class="variant-input" />
            <button class="btn btn-sm btn-delete" @click="removeVariant(index)">🗑️</button>
          </div>
          <button class="btn btn-sm btn-outline" @click="addVariant">+ Tambah Varian</button>
        </div>

        <div class="form-group">
          <label>Status</label>
          <div class="toggle-group">
            <button type="button" :class="['toggle-btn', { active: form.isActive }]" @click="form.isActive = true">
              ✓ Aktif
            </button>
            <button type="button" :class="['toggle-btn', { active: !form.isActive }]" @click="form.isActive = false">
              ✕ Nonaktif
            </button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Batal</button>
        <button class="btn btn-primary" @click="$emit('save', form)">Simpan</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  editing: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  uploadHandler: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['close', 'save', 'update:modelValue'])

const form = ref({ ...props.modelValue })
const uploading = ref(false)

watch(() => props.modelValue, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const generateSlug = () => {
  form.value.slug = form.value.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const addVariant = () => {
  if (!form.value.variants) form.value.variants = []
  form.value.variants.push({ name: '', price: 0, originalPrice: 0, isWarranty: false, isActive: true })
}

const removeVariant = (index) => {
  form.value.variants.splice(index, 1)
}

const handleImageUpload = async (e) => {
  if (!props.uploadHandler) return
  const file = e.target.files[0]
  if (!file) return
  
  uploading.value = true
  try {
    const url = await props.uploadHandler(file)
    form.value.image = url
  } catch (err) {
    console.error('Upload failed:', err)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 700px;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
}

.image-upload-group {
  display: flex;
  gap: 10px;
}

.image-upload-group input {
  flex: 1;
}

.upload-btn {
  padding: 10px 15px;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.preview-image {
  margin-top: 10px;
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
}

.variant-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.variant-input {
  flex: 1;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  padding: 10px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #EBF5FF;
  border-color: #3B82F6;
  color: #1D4ED8;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-outline {
  background: white;
  border: 2px solid #3B82F6;
  color: #3B82F6;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 0.8rem;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
}
</style>
