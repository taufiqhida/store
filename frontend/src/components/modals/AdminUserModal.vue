<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ editing ? '✏️ Edit Admin' : '➕ Tambah Admin' }}</h2>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label>Username *</label>
            <input 
              v-model="form.username" 
              type="text" 
              required 
              placeholder="username123"
            />
          </div>

          <div class="form-group">
            <label>{{ editing ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *' }}</label>
            <input 
              v-model="form.password" 
              type="password" 
              :required="!editing"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="John Doe"
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="admin@example.com"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Role *</label>
          <select v-model="form.role" required @change="handleRoleChange">
            <option value="ADMIN">👤 Admin</option>
            <option value="SUPER_ADMIN">👑 Super Admin</option>
          </select>
        </div>

        <div v-if="form.role !== 'SUPER_ADMIN'" class="permissions-section">
          <div class="permissions-header">
            <label>Permissions (Akses Menu)</label>
            <button type="button" class="btn-select-all" @click="toggleAllPermissions">
              {{ allSelected ? 'Deselect All' : 'Select All' }}
            </button>
          </div>
          
          <div class="permissions-grid">
            <label v-for="perm in availablePermissions" :key="perm.key" class="permission-item">
              <input 
                type="checkbox" 
                :value="perm.key"
                v-model="form.permissions"
              />
              <span>{{ perm.icon }} {{ perm.label }}</span>
            </label>
          </div>
        </div>

        <div v-else class="super-admin-note">
          <p>👑 <strong>Super Admin</strong> otomatis memiliki akses ke semua menu.</p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Batal
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  modelValue: Object,
  editing: Boolean,
  loading: Boolean,
  error: String
})

const emit = defineEmits(['close', 'submit', 'update:modelValue'])

const availablePermissions = [
  { key: 'orders', label: 'Pesanan', icon: '📋' },
  { key: 'products', label: 'Produk', icon: '📦' },
  { key: 'categories', label: 'Kategori', icon: '📁' },
  { key: 'payments', label: 'Pembayaran', icon: '💳' },
  { key: 'discounts', label: 'Diskon', icon: '🏷️' },
  { key: 'flashsales', label: 'Flash Sale', icon: '⚡' },
  { key: 'testimonials', label: 'Testimoni', icon: '💬' },
  { key: 'articles', label: 'Artikel', icon: '📰' },
  { key: 'settings', label: 'Pengaturan', icon: '⚙️' },
  { key: 'admin_users', label: 'Admin Users', icon: '👥' }
]

const form = ref({
  username: '',
  password: '',
  name: '',
  email: '',
  role: 'ADMIN',
  permissions: []
})

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.value = { ...newVal }
  }
}, { immediate: true })

// Update parent model
watch(form, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

const allSelected = computed(() => {
  return form.value.permissions.length === availablePermissions.length
})

const handleRoleChange = () => {
  if (form.value.role === 'SUPER_ADMIN') {
    form.value.permissions = ['*']
  } else {
    form.value.permissions = []
  }
}

const toggleAllPermissions = () => {
  if (allSelected.value) {
    form.value.permissions = []
  } else {
    form.value.permissions = availablePermissions.map(p => p.key)
  }
}

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f3f4f6;
  font-size: 1.25rem;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-form {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.permissions-section {
  margin: 24px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.permissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.permissions-header label {
  font-weight: 600;
  color: #374151;
}

.btn-select-all {
  padding: 6px 12px;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-select-all:hover {
  background: #c7d2fe;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.permission-item:hover {
  border-color: #3B82F6;
  background: #eff6ff;
}

.permission-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.permission-item span {
  font-size: 0.875rem;
  font-weight: 500;
}

.super-admin-note {
  padding: 16px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  margin: 20px 0;
}

.super-admin-note p {
  color: #92400e;
  font-size: 0.875rem;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel {
  padding: 12px 24px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
