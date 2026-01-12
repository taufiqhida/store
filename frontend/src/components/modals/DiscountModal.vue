<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal admin-modal large-modal">
      <div class="modal-header">
        <h3>{{ editing ? 'Edit' : 'Tambah' }} Diskon</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Kode Diskon</label>
            <input v-model="form.code" placeholder="TAHUNBARU2026" style="text-transform: uppercase;" />
          </div>
          <div class="form-group">
            <label>Nama Diskon</label>
            <input v-model="form.name" placeholder="Promo Tahun Baru" />
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Tipe Diskon</label>
            <select v-model="form.type">
              <option value="fixed">Fixed (Rp)</option>
              <option value="percent">Persen (%)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nilai</label>
            <input v-model.number="form.value" type="number" placeholder="10000" />
            <small>{{ form.type === 'percent' ? 'Dalam persen (%)' : 'Dalam Rupiah (Rp)' }}</small>
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Max Diskon (untuk %)</label>
            <input v-model.number="form.maxDiscount" type="number" placeholder="50000" />
          </div>
          <div class="form-group">
            <label>Min Pembelian</label>
            <input v-model.number="form.minPurchase" type="number" placeholder="100000" />
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Batas Penggunaan</label>
            <input v-model.number="form.usageLimit" type="number" placeholder="100" />
            <small>Kosongkan untuk unlimited</small>
          </div>
          <div class="form-group">
            <label>Berlaku Sampai</label>
            <input v-model="form.expiresAt" type="datetime-local" />
          </div>
        </div>
        
        <div class="form-group">
          <label>Berlaku Untuk</label>
          <select v-model="form.applyTo">
            <option value="all">Semua Produk</option>
            <option value="products">Produk Tertentu</option>
          </select>
        </div>
        
        <div class="form-group" v-if="form.applyTo === 'products'">
          <label>Pilih Produk</label>
          <div class="product-selection">
            <label 
              v-for="prod in products" 
              :key="prod.id" 
              :class="['product-chip', { selected: form.productIds?.includes(prod.id) }]"
            >
              <input 
                type="checkbox" 
                :value="prod.id" 
                v-model="form.productIds"
                hidden
              />
              <img v-if="prod.image" :src="prod.image" class="product-chip-img" />
              {{ prod.name }}
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label>Status</label>
          <div class="toggle-group">
            <button type="button" :class="['toggle-btn', { active: form.isActive }]" @click="form.isActive = true">✓ Aktif</button>
            <button type="button" :class="['toggle-btn', { active: !form.isActive }]" @click="form.isActive = false">✕ Nonaktif</button>
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
  modelValue: { type: Object, required: true },
  editing: { type: Boolean, default: false },
  products: { type: Array, default: () => [] }
})

defineEmits(['close', 'save'])

const form = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.modal { background: white; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }
.large-modal { max-width: 700px; }
.modal-header { padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 1.25rem; font-weight: 600; }
.modal-close { width: 36px; height: 36px; border-radius: 50%; background: #f3f4f6; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.875rem; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
.form-group small { display: block; margin-top: 5px; color: #6b7280; font-size: 0.75rem; }
.product-selection { display: flex; flex-wrap: wrap; gap: 8px; max-height: 200px; overflow-y: auto; padding: 10px; background: #f9fafb; border-radius: 8px; }
.product-chip { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
.product-chip:hover { border-color: #3B82F6; }
.product-chip.selected { background: #EBF5FF; border-color: #3B82F6; color: #1D4ED8; }
.product-chip-img { width: 24px; height: 24px; border-radius: 4px; object-fit: contain; }
.toggle-group { display: flex; gap: 8px; }
.toggle-btn { padding: 10px 18px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-weight: 500; background: white; cursor: pointer; }
.toggle-btn.active { background: #EBF5FF; border-color: #3B82F6; color: #1D4ED8; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; }
.btn-primary { background: #3B82F6; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
</style>
