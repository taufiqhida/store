<template>
  <div>
    <div class="section-header">
      <h2>Flash Sale</h2>
      <button class="btn btn-primary" @click="$emit('add')">+ Tambah Flash Sale</button>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Judul</th><th>Produk</th><th>Varian</th><th>Diskon</th><th>Mulai</th><th>Selesai</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          <tr v-for="fs in paginatedItems" :key="fs.id">
            <td><strong>{{ fs.title }}</strong></td>
            <td>{{ fs.productName }}</td>
            <td>{{ fs.variantName || 'Semua' }}</td>
            <td>{{ fs.discountPercent }}%</td>
            <td>{{ formatDate(fs.startDate) }}</td>
            <td>{{ formatDate(fs.endDate) }}</td>
            <td><span :class="['status', fs.isActive ? 'active' : 'inactive']">{{ fs.isActive ? 'Aktif' : 'Nonaktif' }}</span></td>
            <td>
              <button class="btn btn-sm btn-edit" @click="$emit('edit', fs)">✏️</button>
              <button class="btn btn-sm btn-delete" @click="$emit('delete', fs)">🗑️</button>
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
  flashSales: {
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

defineEmits(['add', 'edit', 'delete', 'update:currentPage'])

const paginatedItems = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  return props.flashSales.slice(start, start + props.itemsPerPage)
})

const totalPages = computed(() => Math.ceil(props.flashSales.length / props.itemsPerPage))

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID')
}
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

.status.inactive {
  background: #fee2e2;
  color: #dc2626;
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

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-primary:hover {
  background: #2563EB;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 0.8rem;
}

.btn-edit {
  background: #e0e7ff;
  color: #4338ca;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
  margin-left: 5px;
}
</style>
