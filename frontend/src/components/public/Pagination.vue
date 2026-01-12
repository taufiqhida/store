<template>
  <div v-if="totalPages > 1" class="pagination-controls">
    <button class="page-btn" :disabled="currentPage <= 1" @click="$emit('prev')">← Sebelumnya</button>
    <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
    <button class="page-btn" :disabled="currentPage >= totalPages" @click="$emit('next')">Selanjutnya →</button>
  </div>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

defineEmits(['prev', 'next'])
</script>

<style scoped>
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
}

.page-btn {
  padding: 12px 24px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #111827;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 500;
}
</style>
