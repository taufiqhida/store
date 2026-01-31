<template>
  <div class="admin-users-tab">
    <div class="tab-header">
      <h2>👥 Kelola Admin Users</h2>
      <button class="btn-add" @click="$emit('add')">
        ➕ Tambah Admin
      </button>
    </div>

    <div class="filters">
      <button 
        :class="['filter-btn', { active: filter === 'all' }]"
        @click="filter = 'all'"
      >
        Semua ({{ users.length }})
      </button>
      <button 
        :class="['filter-btn', { active: filter === 'active' }]"
        @click="filter = 'active'"
      >
        Aktif ({{ activeUsers.length }})
      </button>
      <button 
        :class="['filter-btn', { active: filter === 'inactive' }]"
        @click="filter = 'inactive'"
      >
        Nonaktif ({{ inactiveUsers.length }})
      </button>
    </div>

    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <strong>{{ user.username }}</strong>
            </td>
            <td>{{ user.name }}</td>
            <td>{{ user.email || '-' }}</td>
            <td>
              <span :class="['badge-role', user.role.toLowerCase()]">
                {{ user.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '👤 Admin' }}
              </span>
            </td>
            <td>
              <span :class="['badge-status', user.isActive ? 'active' : 'inactive']">
                {{ user.isActive ? '✓ Aktif' : '✗ Nonaktif' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="actions">
                <button 
                  v-if="user.isActive"
                  class="btn-edit" 
                  @click="$emit('edit', user)"
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  v-if="user.isActive"
                  class="btn-delete" 
                  @click="$emit('delete', user)"
                  title="Nonaktifkan"
                >
                  🗑️
                </button>
                <button 
                  v-if="!user.isActive"
                  class="btn-restore" 
                  @click="$emit('restore', user)"
                  title="Aktifkan Kembali"
                >
                  ♻️ Restore
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
})

defineEmits(['add', 'edit', 'delete', 'restore'])

const filter = ref('all')

const activeUsers = computed(() => props.users.filter(u => u.isActive))
const inactiveUsers = computed(() => props.users.filter(u => !u.isActive))

const filteredUsers = computed(() => {
  if (filter.value === 'active') return activeUsers.value
  if (filter.value === 'inactive') return inactiveUsers.value
  return props.users
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}
</script>

<style scoped>
.admin-users-tab {
  padding: 20px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tab-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.btn-add {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-weight: 500;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #3B82F6;
}

.filter-btn.active {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table thead {
  background: #f9fafb;
}

.admin-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.admin-table td {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.admin-table tbody tr:hover {
  background: #f9fafb;
}

.badge-role {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-role.super_admin {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.badge-role.admin {
  background: #e0e7ff;
  color: #3730a3;
}

.badge-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-status.active {
  background: #d1fae5;
  color: #065f46;
}

.badge-status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-edit {
  background: #e0e7ff;
  color: #3730a3;
}

.btn-edit:hover {
  background: #c7d2fe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

.btn-restore {
  background: #d1fae5;
  color: #065f46;
}

.btn-restore:hover {
  background: #a7f3d0;
}
</style>
