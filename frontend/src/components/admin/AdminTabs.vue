<template>
  <div class="tabs-container">
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]" 
        @click="$emit('update:activeTab', tab.id)"
      >
        {{ tab.icon }} {{ tab.label }} ({{ tab.count }})
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true
    // Expected format: [{ id: 'products', icon: '📦', label: 'Produk', count: 10 }]
  }
})

defineEmits(['update:activeTab'])
</script>

<style scoped>
.tabs-container {
  background: #f9fafb;
  padding: 15px 30px;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}

.tabs {
  display: flex;
  gap: 10px;
  min-width: max-content;
}

.tab {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  background: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  background: #f3f4f6;
}

.tab.active {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}
</style>
