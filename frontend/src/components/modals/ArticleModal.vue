<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal admin-modal">
      <div class="modal-header">
        <h3>{{ editing ? 'Edit' : 'Tambah' }} Artikel</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Judul Artikel</label>
          <input v-model="form.title" @input="generateSlug" placeholder="Judul artikel..." />
        </div>
        <div class="form-group">
          <label>Slug</label>
          <input v-model="form.slug" placeholder="slug-artikel" />
        </div>
        <div class="form-group">
          <label>Cover Image (URL)</label>
          <input v-model="form.image" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label>Konten</label>
          <textarea v-model="form.content" rows="6" placeholder="Tulis konten artikel..."></textarea>
        </div>
        <div class="form-group">
          <label>Status</label>
          <div class="toggle-group">
            <button type="button" :class="['toggle-btn', { active: form.isPublished }]" @click="form.isPublished = true">✓ Published</button>
            <button type="button" :class="['toggle-btn', { active: !form.isPublished }]" @click="form.isPublished = false">✕ Draft</button>
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
  editing: { type: Boolean, default: false }
})

defineEmits(['close', 'save'])

const form = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const generateSlug = () => {
  form.value.slug = form.value.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.875rem; }
.form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
.toggle-group { display: flex; gap: 8px; }
.toggle-btn { padding: 10px 18px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-weight: 500; background: white; cursor: pointer; }
.toggle-btn.active { background: #EBF5FF; border-color: #3B82F6; color: #1D4ED8; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; }
.btn-primary { background: #3B82F6; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
</style>
