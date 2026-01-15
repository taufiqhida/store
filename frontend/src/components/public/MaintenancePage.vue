<template>
  <div class="maintenance-page">
    <div class="gear-bg">
      <div class="gear gear-1">⚙️</div>
      <div class="gear gear-2">⚙️</div>
      <div class="gear gear-3">🔧</div>
    </div>
    
    <div class="content">
      <div class="icon-container">
        <div class="icon-pulse"></div>
        <div class="main-icon">🛠️</div>
      </div>
      
      <h1 class="store-name">{{ storeName }}</h1>
      <h2 class="title">Sedang Maintenance</h2>
      <p class="message">{{ message }}</p>
      
      <!-- Countdown Timer -->
      <div class="countdown" v-if="showCountdown">
        <p class="countdown-label-top">Estimasi selesai dalam:</p>
        <div class="countdown-grid">
          <div class="countdown-item">
            <div class="countdown-value">{{ countdown.days }}</div>
            <div class="countdown-label">Hari</div>
          </div>
          <div class="countdown-item">
            <div class="countdown-value">{{ countdown.hours }}</div>
            <div class="countdown-label">Jam</div>
          </div>
          <div class="countdown-item">
            <div class="countdown-value">{{ countdown.minutes }}</div>
            <div class="countdown-label">Menit</div>
          </div>
          <div class="countdown-item">
            <div class="countdown-value">{{ countdown.seconds }}</div>
            <div class="countdown-label">Detik</div>
          </div>
        </div>
      </div>
      
      <div class="footer-text">
        Mohon maaf atas ketidaknyamanannya
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  storeName: { type: String, default: 'TOKO' },
  message: { type: String, default: 'Kami sedang melakukan perbaikan untuk memberikan pengalaman yang lebih baik.' },
  endDate: { type: String, default: '' }
})

const countdown = ref({ days: '00', hours: '00', minutes: '00', seconds: '00' })
let timer = null

const showCountdown = computed(() => {
  return props.endDate && new Date(props.endDate) > new Date()
})

function updateCountdown() {
  if (!props.endDate) return
  
  const target = new Date(props.endDate).getTime()
  const now = new Date().getTime()
  const diff = target - now
  
  if (diff <= 0) {
    countdown.value = { days: '00', hours: '00', minutes: '00', seconds: '00' }
    return
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  countdown.value = {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.gear-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.15;
}

.gear {
  position: absolute;
  font-size: 8rem;
  animation: spin infinite linear;
}

.gear-1 { top: 10%; left: 5%; animation-duration: 20s; }
.gear-2 { bottom: 15%; right: 10%; animation-duration: 15s; animation-direction: reverse; }
.gear-3 { top: 50%; left: 80%; animation-duration: 25s; font-size: 5rem; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.content {
  text-align: center;
  z-index: 10;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 50px 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 25px;
}

.icon-pulse {
  position: absolute;
  inset: -15px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.main-icon {
  font-size: 5rem;
  animation: wobble 2s ease-in-out infinite;
}

@keyframes wobble {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

.store-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #d97706;
  margin-bottom: 15px;
}

.message {
  font-size: 1rem;
  color: #78716c;
  line-height: 1.7;
  margin-bottom: 30px;
}

.countdown {
  margin-bottom: 30px;
}

.countdown-label-top {
  font-size: 0.875rem;
  color: #92400e;
  margin-bottom: 15px;
  font-weight: 500;
}

.countdown-grid {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.countdown-item {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 12px;
  padding: 15px 20px;
  min-width: 70px;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
}

.countdown-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.countdown-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

.footer-text {
  font-size: 0.875rem;
  color: #a8a29e;
}

@media (max-width: 640px) {
  .content { padding: 35px 25px; }
  .main-icon { font-size: 4rem; }
  .store-name { font-size: 1.25rem; }
  .title { font-size: 1.5rem; }
  .countdown-grid { flex-wrap: wrap; }
  .countdown-item { padding: 12px 15px; min-width: 60px; }
  .countdown-value { font-size: 1.5rem; }
}
</style>
