<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal admin-modal">
      <div class="modal-header">
        <h3>⚙️ Store Settings</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nama Toko</label>
          <input v-model="form.store_name" />
        </div>
        <div class="form-group">
          <label>Tagline</label>
          <input v-model="form.store_tagline" />
        </div>
        <div class="form-group">
          <label>Nomor WhatsApp (tanpa +)</label>
          <input v-model="form.whatsapp_number" placeholder="6281234567890" />
        </div>
        <div class="form-group">
          <label>Template Pesan WhatsApp</label>
          <textarea v-model="form.whatsapp_message_template" rows="8"></textarea>
          <small>Variabel: {product}, {variant}, {quantity}, {price}, {unique_code}, {total}, {payment}</small>
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
  modelValue: { type: Object, required: true }
})

defineEmits(['close', 'save'])

const form = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.modal { background: white; border-radius: 16px; max-width: 550px; width: 100%; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 1.25rem; font-weight: 600; }
.modal-close { width: 36px; height: 36px; border-radius: 50%; background: #f3f4f6; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.875rem; }
.form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
.form-group small { display: block; margin-top: 5px; color: #6b7280; font-size: 0.75rem; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; }
.btn-primary { background: #3B82F6; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
</style>
