<template>
  <header class="admin-header">
    <div class="header-left">
      <h1>📊 Admin Dashboard</h1>
      <span>Selamat datang, {{ adminName }}</span>
    </div>
    <div class="header-right">
      <button class="btn btn-outline" @click="$emit('openCredentials')">🔐 Ubah Password</button>
      <button class="btn btn-secondary" @click="$emit('openSettings')">⚙️ Settings</button>
      <button class="btn btn-danger" @click="handleLogout">Logout</button>
    </div>
  </header>
</template>

<script setup>
import { usePermissions } from '../../composables/usePermissions'

const { clearPermissions } = usePermissions()

defineProps({
  adminName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['openCredentials', 'openSettings', 'logout'])

const handleLogout = () => {
  clearPermissions()
  emit('logout')
}
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left h1 {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.header-left span {
  font-size: 0.875rem;
  opacity: 0.8;
}

.header-right {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-outline {
  background: transparent;
  border: 2px solid rgba(255,255,255,0.5);
  color: white;
}

.btn-outline:hover {
  background: rgba(255,255,255,0.1);
  border-color: white;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
}

.btn-danger {
  background: #DC2626;
  color: white;
}

.btn-danger:hover {
  background: #B91C1C;
}
</style>
