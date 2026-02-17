<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="change-password-modal">
      <button class="close-btn" @click="$emit('close')">×</button>
      
      <div class="modal-header">
        <h2>🔑 Ganti Password</h2>
        <p>Ubah password akun Anda</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label>Password Saat Ini <span class="required">*</span></label>
          <div class="password-input-group">
            <input 
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="Masukkan password saat ini"
              required
            />
            <button 
              type="button"
              class="toggle-password"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              {{ showCurrentPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Password Baru <span class="required">*</span></label>
          <div class="password-input-group">
            <input 
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Minimal 6 karakter"
              required
              minlength="6"
            />
            <button 
              type="button"
              class="toggle-password"
              @click="showNewPassword = !showNewPassword"
            >
              {{ showNewPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <p v-if="form.newPassword && form.newPassword.length < 6" class="input-hint error">
            Password harus minimal 6 karakter
          </p>
        </div>
        
        <div class="form-group">
          <label>Konfirmasi Password Baru <span class="required">*</span></label>
          <div class="password-input-group">
            <input 
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Ketik ulang password baru"
              required
            />
            <button 
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="input-hint error">
            Password tidak cocok
          </p>
          <p v-else-if="form.confirmPassword && form.newPassword === form.confirmPassword" class="input-hint success">
            ✓ Password cocok
          </p>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-if="success" class="success-message">
          {{ success }}
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')" :disabled="loading">
            Batal
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            {{ loading ? 'Memproses...' : 'Simpan Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { updateAdminCredentials } from '../../../services/api'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'success'])

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const isFormValid = computed(() => {
  return form.value.currentPassword &&
         form.value.newPassword &&
         form.value.newPassword.length >= 6 &&
         form.value.confirmPassword &&
         form.value.newPassword === form.value.confirmPassword
})

// Reset form when modal is closed/opened
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
    error.value = ''
    success.value = ''
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    await updateAdminCredentials({
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword
    })
    
    success.value = 'Password berhasil diubah!'
    
    // Close modal after 1.5 seconds
    setTimeout(() => {
      emit('success')
      emit('close')
    }, 1500)
    
  } catch (err) {
    error.value = err.response?.data?.error || 'Gagal mengubah password. Pastikan password lama Anda benar.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
  padding: 20px;
}

.change-password-modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-header {
  padding: 30px 30px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.modal-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.form {
  padding: 30px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
  font-size: 0.9rem;
}

.required {
  color: #dc2626;
  margin-left: 2px;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group input {
  flex: 1;
  padding: 12px 50px 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
  width: 100%;
}

.password-input-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.input-hint {
  font-size: 0.8rem;
  margin-top: 6px;
  margin-bottom: 0;
}

.input-hint.error {
  color: #dc2626;
}

.input-hint.success {
  color: #10b981;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.success-message {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  color: #059669;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-message::before {
  content: '✓';
  font-weight: 700;
  font-size: 1.2rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 640px) {
  .change-password-modal {
    margin: 20px;
  }
  
  .modal-header,
  .form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
