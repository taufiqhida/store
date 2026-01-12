<template>
  <div>
    <div class="section-header">
      <h2>Daftar Kategori</h2>
      <button class="btn btn-primary" @click="$emit('add')">+ Tambah Kategori</button>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>ID</th><th>Nama</th><th>Slug</th><th>Aksi</th></tr></thead>
        <tbody>
          <tr v-for="cat in paginatedItems" :key="cat.id">
            <td>{{ cat.id }}</td>
            <td><strong>{{ cat.name }}</strong></td>
            <td>{{ cat.slug }}</td>
            <td>
              <button class="btn btn-sm btn-edit" @click="$emit('edit', cat)">✏️</button>
              <button class="btn btn-sm btn-delete" @click="$emit('delete', cat)">🗑️</button>
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
  categories: {
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
  return props.categories.slice(start, start + props.itemsPerPage)
})

const totalPages = computed(() => Math.ceil(props.categories.length / props.itemsPerPage))
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
