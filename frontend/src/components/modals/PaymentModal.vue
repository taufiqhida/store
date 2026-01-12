<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal admin-modal">
      <div class="modal-header">
        <h3>{{ editing ? 'Edit' : 'Tambah' }} Metode Pembayaran</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Nama</label>
            <input v-model="form.name" placeholder="GoPay" />
          </div>
          <div class="form-group">
            <label>Icon</label>
            <input v-model="form.icon" placeholder="💚 atau URL gambar" />
          </div>
        </div>
        
        <div class="form-group">
          <label>Tipe Icon</label>
          <select v-model="form.iconType">
            <option value="emoji">Emoji</option>
            <option value="image">Gambar URL</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Info Rekening</label>
          <textarea v-model="form.accountInfo" rows="3" placeholder="GoPay: 08123456789&#10;Nama: Toko ABC"></textarea>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Tipe Fees</label>
            <select v-model="form.feeType">
              <option value="fixed">Fixed (Nominal)</option>
              <option value="percent">Percent (%)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fees</label>
            <input v-model.number="form.fees" type="number" placeholder="0" />
          </div>
        </div>
        
        <div class="form-group">
          <label>Gambar QRIS (Opsional)</label>
          <div class="image-upload-group">
            <input v-model="form.qrisImage" placeholder="https://... atau upload" />
            <label class="upload-btn">
              {{ uploading ? '⏳' : '📁' }} Upload
              <input type="file" accept="image/*" @change="handleUpload" hidden />
            </label>
          </div>
          <img v-if="form.qrisImage" :src="form.qrisImage" class="preview-image" />
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
  uploadHandler: { type: Function, default: null }
})

defineEmits(['close', 'save'])

const form = ref({ ...props.modelValue })
const uploading = ref(false)

watch(() => props.modelValue, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const handleUpload = async (e) => {
  if (!props.uploadHandler) return
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  try {
    form.value.qrisImage = await props.uploadHandler(file)
  } catch (err) {
    console.error('Upload failed:', err)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.modal { background: white; border-radius: 16px; max-width: 550px; width: 100%; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 1.25rem; font-weight: 600; }
.modal-close { width: 36px; height: 36px; border-radius: 50%; background: #f3f4f6; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.875rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
.image-upload-group { display: flex; gap: 10px; }
.image-upload-group input { flex: 1; }
.upload-btn { padding: 10px 15px; background: #f3f4f6; border-radius: 8px; cursor: pointer; font-size: 0.875rem; white-space: nowrap; }
.preview-image { margin-top: 10px; max-width: 150px; max-height: 200px; border-radius: 8px; }
.toggle-group { display: flex; gap: 8px; }
.toggle-btn { padding: 10px 18px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-weight: 500; background: white; cursor: pointer; }
.toggle-btn.active { background: #EBF5FF; border-color: #3B82F6; color: #1D4ED8; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; }
.btn-primary { background: #3B82F6; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
</style>
