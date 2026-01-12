<template>
  <div>
    <div class="section-header">
      <h2>Daftar Diskon</h2>
      <button class="btn btn-primary" @click="$emit('add')">+ Tambah Diskon</button>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Tipe</th>
            <th>Nilai</th>
            <th>Berlaku</th>
            <th>Terpakai</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="disc in paginatedItems" :key="disc.id">
            <td><strong>{{ disc.code }}</strong></td>
            <td>{{ disc.name }}</td>
            <td>{{ disc.type === 'percent' ? 'Persen' : 'Fixed' }}</td>
            <td>
              {{ disc.type === 'percent' ? disc.value + '%' : 'Rp ' + formatPrice(disc.value) }}
              <span v-if="disc.maxDiscount"><br><small>Max: Rp {{ formatPrice(disc.maxDiscount) }}</small></span>
            </td>
            <td>{{ disc.applyTo === 'all' ? 'Semua Produk' : 'Produk Tertentu' }}</td>
            <td>
              <span v-if="disc.usageLimit">{{ disc.usageCount || 0 }}/{{ disc.usageLimit }}</span>
              <span v-else>{{ disc.usageCount || 0 }} (unlimited)</span>
            </td>
            <td>
              <span v-if="disc.usageLimit && disc.usageCount >= disc.usageLimit" class="status promo-habis">🔥 Promo Habis</span>
              <span v-else :class="['status', disc.isActive ? 'active' : 'inactive']">{{ disc.isActive ? 'Aktif' : 'Nonaktif' }}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-edit" @click="$emit('edit', disc)">✏️</button>
              <button class="btn btn-sm btn-delete" @click="$emit('delete', disc)">🗑️</button>
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
  discounts: {
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
  return props.discounts.slice(start, start + props.itemsPerPage)
})

const totalPages = computed(() => Math.ceil(props.discounts.length / props.itemsPerPage))

const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price)
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

.status.promo-habis {
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
