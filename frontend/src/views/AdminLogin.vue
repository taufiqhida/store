<script setup>
import { ref } from 'vue'
import { adminLogin } from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const login = async () => {
  if (!username.value || !password.value) {
    error.value = 'Masukkan username dan password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await adminLogin({
      username: username.value,
      password: password.value
    })

    localStorage.setItem('admin_token', res.data.token)
    localStorage.setItem('admin_user', JSON.stringify(res.data.admin))
    router.push('/admin/dashboard')
  } catch (err) {
    error.value = 'Username atau password salah'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="admin-login">
    <div class="login-card">
      <div class="login-header">
        <h1>🔐 Admin Login</h1>
        <p>Masuk untuk mengelola produk</p>
      </div>

      <form @submit.prevent="login" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username"
            v-model="username"
            placeholder="Masukkan username"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password"
            v-model="password"
            placeholder="Masukkan password"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Loading...' : 'Masuk' }}
        </button>
      </form>

      <a href="/" class="back-link">← Kembali ke Toko</a>
    </div>
  </div>
</template>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 1.75rem;
  margin-bottom: 8px;
}

.login-header p {
  color: #6b7280;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-group input {
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  background: #FEE2E2;
  color: #DC2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
}

.login-btn {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  padding: 16px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-link {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #6b7280;
  font-size: 0.875rem;
}

.back-link:hover {
  color: #3B82F6;
}
</style>
