<template>
  <div>
    <div class="section-header">
      <h2>Testimoni Pelanggan</h2>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Kode Order</th><th>Nama</th><th>Produk</th><th>Rating</th><th>Isi</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          <tr v-for="testi in paginatedItems" :key="testi.id">
            <td><code>{{ testi.orderCode }}</code></td>
            <td><strong>{{ testi.name }}</strong></td>
            <td>{{ testi.productName }}</td>
            <td>{{ '⭐'.repeat(testi.rating) }}</td>
            <td class="content-cell">{{ testi.content }}</td>
            <td>
              <span :class="['status', testi.isApproved ? 'active' : 'pending']">
                {{ testi.isApproved ? '✅ Approved' : '⏳ Pending' }}
              </span>
            </td>
            <td>
              <button v-if="!testi.isApproved" class="btn btn-sm btn-edit" @click="$emit('approve', testi)">✓</button>
              <button v-if="testi.isApproved" class="btn btn-sm btn-secondary" @click="$emit('reject', testi)">✕</button>
              <button class="btn btn-sm btn-delete" @click="$emit('delete', testi)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination 
      v-if="totalPages > 1"
      :current-page="currentPage" 
      :total-pages="totalPages"
      @prev="$emit('update:currentPage', currentPage - 1)"
      @next="$emit('update:currentPage', currentPage + 1)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Pagination from './Pagination.vue'

const props = defineProps({
  testimonials: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Number,
    default: 1
  },
  itemsPerPage: {
    type: Number,
    default: 10
  }
})

defineEmits(['approve', 'reject', 'delete', 'update:currentPage'])

const paginatedItems = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  return props.testimonials.slice(start, start + props.itemsPerPage)
})

const totalPages = computed(() => Math.ceil(props.testimonials.length / props.itemsPerPage))
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6b7280;
}

.content-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status.active {
  background: #d1fae5;
  color: #059669;
}

.status.pending {
  background: #fef3c7;
  color: #d97706;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 0.8rem;
}

.btn-edit {
  background: #d1fae5;
  color: #059669;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
  margin-left: 5px;
}
</style>
