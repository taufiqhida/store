<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="error-animation">
        <h1 class="error-code">404</h1>
        <div class="error-bg">404</div>
      </div>
      
      <h2 class="error-title">Halaman Tidak Ditemukan</h2>
      <p class="error-message">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      
      <div class="countdown-section">
        <p class="countdown-text">
          Anda akan diarahkan ke halaman utama dalam 
          <span class="countdown-number">{{ countdown }}</span> detik
        </p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="goHome" class="home-btn">
          🏠 Kembali ke Halaman Utama
        </button>
        <button @click="goBack" class="back-btn">
          ← Kembali
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(5)
const progressWidth = ref(100)
let timer = null
let progressTimer = null

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  // Countdown timer
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      clearInterval(progressTimer)
      goHome()
    }
  }, 1000)
  
  // Progress bar animation
  progressTimer = setInterval(() => {
    progressWidth.value = (countdown.value / 5) * 100
  }, 50)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (progressTimer) clearInterval(progressTimer)
})
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.not-found-page::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: drift 20s linear infinite;
}

@keyframes drift {
  from { transform: translate(0, 0); }
  to { transform: translate(50px, 50px); }
}

.not-found-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 60px 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.error-animation {
  position: relative;
  margin-bottom: 30px;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  position: relative;
  z-index: 2;
  animation: glitch 3s infinite;
}

.error-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12rem;
  font-weight: 900;
  color: rgba(102, 126, 234, 0.1);
  z-index: 1;
  user-select: none;
}

@keyframes glitch {
  0%, 90%, 100% { transform: translate(0, 0); }
  92% { transform: translate(-2px, 2px); }
  94% { transform: translate(2px, -2px); }
  96% { transform: translate(-2px, -2px); }
  98% { transform: translate(2px, 2px); }
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 15px 0;
}

.error-message {
  font-size: 1.1rem;
  color: #718096;
  margin: 0 0 40px 0;
  line-height: 1.6;
}

.countdown-section {
  background: #f7fafc;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 30px;
}

.countdown-text {
  font-size: 1rem;
  color: #4a5568;
  margin: 0 0 15px 0;
}

.countdown-number {
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 12px;
  border-radius: 8px;
  margin: 0 4px;
  min-width: 40px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.1s linear;
  border-radius: 10px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.home-btn, .back-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.home-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.back-btn {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.back-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .not-found-container {
    padding: 40px 24px;
  }
  
  .error-code {
    font-size: 5rem;
  }
  
  .error-bg {
    font-size: 8rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-message {
    font-size: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .home-btn, .back-btn {
    width: 100%;
  }
}
</style>
