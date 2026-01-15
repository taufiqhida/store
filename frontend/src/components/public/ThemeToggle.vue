<template>
  <button 
    class="theme-toggle" 
    @click="toggleTheme"
    :title="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const currentTheme = ref('system')

// Get system preference
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Apply theme to document
function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

// Toggle between dark and light
function toggleTheme() {
  const current = currentTheme.value === 'system' ? getSystemTheme() : currentTheme.value
  const newTheme = current === 'dark' ? 'light' : 'dark'
  currentTheme.value = newTheme
  applyTheme(newTheme)
  localStorage.setItem('theme', newTheme)
}

// Initialize theme on mount
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    currentTheme.value = saved
    applyTheme(saved)
  } else {
    currentTheme.value = 'system'
    // System preference is handled by CSS media query
  }

  // Watch for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (currentTheme.value === 'system') {
      // Re-trigger CSS by removing attribute
      document.documentElement.removeAttribute('data-theme')
    }
  })

  // Update display based on actual applied theme
  if (currentTheme.value === 'system') {
    currentTheme.value = getSystemTheme()
  }
})
</script>

<style scoped>
.theme-toggle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  transform: scale(1.05);
}

.theme-icon {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(20deg);
}
</style>
