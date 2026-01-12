<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal admin-modal">
      <div class="modal-header">
        <h3>{{ editing ? 'Edit' : 'Tambah' }} Flash Sale</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Judul Flash Sale</label>
          <input v-model="form.title" placeholder="Promo Akhir Tahun!" />
        </div>
        <div class="form-group">
          <label>Deskripsi (Opsional)</label>
          <textarea v-model="form.description" rows="2" placeholder="Deskripsi promo..."></textarea>
        </div>
        <div class="form-group">
          <label>Pilih Produk</label>
          <select v-model="form.productId" @change="onProductChange">
            <option v-for="prod in products" :key="prod.id" :value="prod.id">{{ prod.name }}</option>
          </select>
        </div>
        <div class="form-group" v-if="productVariants.length > 0">
          <label>Pilih Varian (Opsional)</label>
          <select v-model="form.variantId">
            <option value="">-- Semua Varian --</option>
            <option v-for="v in productVariants" :key="v.id" :value="v.id">
              {{ v.name }} - Rp {{ formatPrice(v.price) }}
            </option>
          </select>
          <small>Kosongkan untuk menerapkan flash sale ke semua varian produk</small>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Diskon (%)</label>
            <input v-model.number="form.discountPercent" type="number" min="1" max="100" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.isActive">
              <option :value="true">Aktif</option>
              <option :value="false">Nonaktif</option>
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Tanggal Mulai</label>
            <input v-model="form.startDate" type="datetime-local" />
          </div>
          <div class="form-group">
            <label>Tanggal Selesai</label>
            <input v-model="form.endDate" type="datetime-local" />
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
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  editing: {
    type: Boolean,
    default: false
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save', 'update:modelValue'])

const form = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const productVariants = computed(() => {
  const productId = parseInt(form.value.productId)
  if (!productId) return []
  const product = props.products.find(p => p.id === productId)
  return product?.variants || []
})

const onProductChange = () => {
  form.value.variantId = ''
}

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

.form-group small {
  display: block;
  margin-top: 5px;
  color: #6b7280;
  font-size: 0.75rem;
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
</style>
