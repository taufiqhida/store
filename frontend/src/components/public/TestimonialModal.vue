<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="testimonial-modal">
      <button class="modal-close" @click="$emit('close')">×</button>
      
      <div class="modal-content">
        <h2>✍️ Tulis Testimoni</h2>
        <p class="modal-desc">Bagikan pengalaman Anda! Masukkan kode pemesanan untuk menulis testimoni.</p>
        
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>
        
        <div class="form-group">
          <label>Kode Pemesanan *</label>
          <input 
            v-model="form.orderCode" 
            placeholder="Contoh: ORD-123456"
          />
          <small>Kode yang Anda terima saat melakukan pemesanan</small>
        </div>
        
        <div class="form-group">
          <label>Nama Anda *</label>
          <input v-model="form.name" placeholder="Masukkan nama Anda" />
        </div>
        
        <div class="form-group">
          <label>Rating</label>
          <div class="rating-input">
            <button 
              v-for="star in 5" 
              :key="star"
              type="button"
              :class="['star-btn', { active: star <= form.rating }]"
              @click="form.rating = star"
            >
              {{ star <= form.rating ? '⭐' : '☆' }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Testimoni Anda *</label>
          <textarea 
            v-model="form.content" 
            rows="4" 
            placeholder="Ceritakan pengalaman Anda..."
          ></textarea>
        </div>
        
        <button 
          class="submit-btn" 
          @click="$emit('submit', form)"
          :disabled="loading"
        >
          {{ loading ? 'Mengirim...' : '📤 Kirim Testimoni' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  modelValue: Object,
  loading: Boolean,
  error: String,
  success: String
})

const emit = defineEmits(['close', 'submit', 'update:modelValue'])

const form = ref({ ...props.modelValue })

watch(() => props.modelValue, (v) => {
  form.value = { ...v }
}, { deep: true })

watch(form, (v) => {
  emit('update:modelValue', v)
}, { deep: true })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.testimonial-modal {
  background: white;
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-content {
  padding: 30px;
}

.modal-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.modal-desc {
  color: #6b7280;
  margin-bottom: 25px;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #f0fdf4;
  color: #059669;
  border: 1px solid #bbf7d0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #6b7280;
  font-size: 0.8rem;
}

.rating-input {
  display: flex;
  gap: 8px;
}

.star-btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.star-btn:hover {
  transform: scale(1.2);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
