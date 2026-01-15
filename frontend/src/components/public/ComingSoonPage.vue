<template>
  <div class="coming-soon-page">
    <div class="particles">
      <div v-for="n in 20" :key="n" class="particle" :style="particleStyle(n)"></div>
    </div>
    
    <div class="content">
      <div class="logo-container">
        <div class="logo-glow"></div>
        <h1 class="store-name">{{ storeName }}</h1>
      </div>
      
      <h2 class="title">Coming Soon</h2>
      <p class="message">{{ message }}</p>
      
      <!-- Countdown Timer -->
      <div class="countdown" v-if="showCountdown">
        <div class="countdown-item">
          <div class="countdown-value">{{ countdown.days }}</div>
          <div class="countdown-label">Hari</div>
        </div>
        <div class="countdown-separator">:</div>
        <div class="countdown-item">
          <div class="countdown-value">{{ countdown.hours }}</div>
          <div class="countdown-label">Jam</div>
        </div>
        <div class="countdown-separator">:</div>
        <div class="countdown-item">
          <div class="countdown-value">{{ countdown.minutes }}</div>
          <div class="countdown-label">Menit</div>
        </div>
        <div class="countdown-separator">:</div>
        <div class="countdown-item">
          <div class="countdown-value">{{ countdown.seconds }}</div>
          <div class="countdown-label">Detik</div>
        </div>
      </div>
      
      <div class="tagline">{{ tagline }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  storeName: { type: String, default: 'TOKO' },
  tagline: { type: String, default: 'Selamat Datang' },
  message: { type: String, default: 'Kami sedang menyiapkan sesuatu yang luar biasa untuk Anda!' },
  targetDate: { type: String, default: '' }
})

const countdown = ref({ days: '00', hours: '00', minutes: '00', seconds: '00' })
let timer = null

const showCountdown = computed(() => {
  return props.targetDate && new Date(props.targetDate) > new Date()
})

function updateCountdown() {
  if (!props.targetDate) return
  
  const target = new Date(props.targetDate).getTime()
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

function particleStyle(n) {
  const size = Math.random() * 6 + 2
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${Math.random() * 10 + 10}s`
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
.coming-soon-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
}

.content {
  text-align: center;
  z-index: 10;
  max-width: 700px;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.logo-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
  filter: blur(20px);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.store-name {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 4px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 15px;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
}

.message {
  font-size: 1.125rem;
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 40px;
}

.countdown {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.countdown-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 25px;
  min-width: 90px;
}

.countdown-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  font-family: 'Courier New', monospace;
}

.countdown-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 8px;
}

.countdown-separator {
  font-size: 2rem;
  color: #3b82f6;
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.tagline {
  font-size: 1rem;
  color: #64748b;
  letter-spacing: 3px;
  text-transform: uppercase;
}

@media (max-width: 640px) {
  .store-name { font-size: 2rem; letter-spacing: 2px; }
  .title { font-size: 1.75rem; }
  .message { font-size: 1rem; }
  .countdown { gap: 5px; flex-wrap: wrap; }
  .countdown-item { padding: 15px 18px; min-width: 70px; }
  .countdown-value { font-size: 1.75rem; }
  .countdown-separator { font-size: 1.5rem; }
}
</style>
