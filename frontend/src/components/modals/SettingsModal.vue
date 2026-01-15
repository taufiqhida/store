<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal admin-modal settings-modal">
      <div class="modal-header">
        <h3>⚙️ Store Settings</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <!-- Site Mode Section -->
        <div class="settings-section">
          <h4>🌐 Mode Situs</h4>
          <div class="form-group">
            <label>Status Situs</label>
            <select v-model="form.site_mode" class="form-select">
              <option value="live">🟢 Live (Toko Aktif)</option>
              <option value="coming_soon">🟡 Coming Soon</option>
              <option value="maintenance">🔴 Maintenance</option>
            </select>
          </div>

          <!-- Coming Soon Settings -->
          <template v-if="form.site_mode === 'coming_soon'">
            <div class="form-group">
              <label>Pesan Coming Soon</label>
              <textarea v-model="form.coming_soon_message" rows="3" placeholder="Pesan yang akan ditampilkan..."></textarea>
            </div>
            <div class="form-group">
              <label>Target Tanggal Launching</label>
              <input type="datetime-local" v-model="comingSoonDateLocal" />
              <small>Countdown akan menghitung mundur ke tanggal ini</small>
            </div>
          </template>

          <!-- Maintenance Settings -->
          <template v-if="form.site_mode === 'maintenance'">
            <div class="form-group">
              <label>Pesan Maintenance</label>
              <textarea v-model="form.maintenance_message" rows="3" placeholder="Pesan yang akan ditampilkan..."></textarea>
            </div>
            <div class="form-group">
              <label>Estimasi Selesai</label>
              <input type="datetime-local" v-model="maintenanceEndDateLocal" />
              <small>Countdown estimasi maintenance selesai</small>
            </div>
          </template>
        </div>

        <hr class="section-divider" />

        <!-- Store Info Section -->
        <div class="settings-section">
          <h4>🏪 Informasi Toko</h4>
          <div class="form-group">
            <label>Nama Toko</label>
            <input v-model="form.store_name" />
          </div>
          <div class="form-group">
            <label>Tagline</label>
            <input v-model="form.store_tagline" />
          </div>
        </div>

        <hr class="section-divider" />

        <!-- WhatsApp Section -->
        <div class="settings-section">
          <h4>📱 WhatsApp</h4>
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
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Batal</button>
        <button class="btn btn-primary" @click="handleSave">Simpan</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['close', 'save'])

const form = ref({ ...props.modelValue })

// Convert ISO date to local datetime-local format
const comingSoonDateLocal = computed({
  get() {
    if (!form.value.coming_soon_date) return ''
    return form.value.coming_soon_date.slice(0, 16)
  },
  set(val) {
    form.value.coming_soon_date = val ? val + ':00' : ''
  }
})

const maintenanceEndDateLocal = computed({
  get() {
    if (!form.value.maintenance_end_date) return ''
    return form.value.maintenance_end_date.slice(0, 16)
  },
  set(val) {
    form.value.maintenance_end_date = val ? val + ':00' : ''
  }
})

watch(() => props.modelValue, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

function handleSave() {
  emit('save', form.value)
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.settings-modal { max-width: 600px; }
.modal { background: white; border-radius: 16px; width: 100%; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: white; z-index: 10; }
.modal-header h3 { font-size: 1.25rem; font-weight: 600; }
.modal-close { width: 36px; height: 36px; border-radius: 50%; background: #f3f4f6; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px; position: sticky; bottom: 0; background: white; }

.settings-section { margin-bottom: 10px; }
.settings-section h4 { font-size: 1rem; font-weight: 600; color: #374151; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
.section-divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.875rem; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
.form-group small { display: block; margin-top: 5px; color: #6b7280; font-size: 0.75rem; }

.form-select { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 10px center; background-repeat: no-repeat; background-size: 20px; padding-right: 40px; }

.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; }
.btn-primary { background: #3B82F6; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
</style>
