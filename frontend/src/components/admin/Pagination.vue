<template>
  <div v-if="totalPages > 1" class="pagination">
    <button class="page-btn" :disabled="currentPage <= 1" @click="$emit('prev')">← Prev</button>
    <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
    <button class="page-btn" :disabled="currentPage >= totalPages" @click="$emit('next')">Next →</button>
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
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
