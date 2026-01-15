<template>
  <nav class="navbar">
    <div class="container navbar-inner">
      <a class="nav-logo" href="#">{{ storeName }}</a>
      <div class="nav-links">
        <router-link to="/artikel" class="nav-link">📰 Artikel</router-link>
        <router-link to="/admin/login" class="nav-link">Admin</router-link>
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>

<script setup>
import ThemeToggle from './ThemeToggle.vue'

defineProps({
  storeName: String
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--navbar-bg);
  backdrop-filter: blur(10px);
  padding: 15px 0;
  z-index: 1000;
  box-shadow: var(--shadow);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 15px;
  align-items: center;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  color: var(--text);
}

.nav-link:hover {
  background: var(--bg-secondary);
}
</style>

