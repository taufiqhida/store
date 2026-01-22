<template>
  <a 
    v-if="whatsappNumber"
    :href="whatsappUrl"
    target="_blank"
    class="whatsapp-float"
    title="Chat via WhatsApp"
  >
    <svg viewBox="0 0 32 32" class="wa-icon">
      <path fill="#fff" d="M16 0C7.163 0 0 7.163 0 16c0 2.837.736 5.502 2.022 7.818L0 32l8.41-2.206A15.924 15.924 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.035 23.222c-.337.951-1.676 1.74-2.756 1.97-.741.156-1.71.28-4.97-.997-4.174-1.634-6.863-5.868-7.07-6.14-.2-.27-1.672-2.226-1.672-4.247 0-2.02 1.058-3.014 1.434-3.426.337-.369.895-.537 1.43-.537.173 0 .328.01.467.017.376.016.564.038.812.628.31.737 1.066 2.606 1.16 2.797.095.19.158.413.032.666-.121.254-.182.413-.363.635-.182.222-.382.496-.546.666-.182.19-.371.396-.16.778.212.381.942 1.553 2.023 2.514 1.39 1.235 2.562 1.617 2.925 1.797.363.182.575.152.787-.091.221-.254.927-1.082 1.175-1.453.247-.37.495-.307.83-.182.337.121 2.14 1.009 2.506 1.193.367.182.612.27.702.423.093.152.093.888-.243 1.839z"/>
    </svg>
    <span class="wa-tooltip">Chat dengan Kami</span>
  </a>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  whatsappNumber: {
    type: String,
    default: ''
  }
})

const whatsappUrl = computed(() => {
  if (!props.whatsappNumber) return ''
  const message = encodeURIComponent('Halo, saya ingin bertanya tentang produk Anda.')
  return `https://wa.me/${props.whatsappNumber}?text=${message}`
})
</script>

<style scoped>
.whatsapp-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 30px rgba(37, 211, 102, 0.4);
  z-index: 1000;
  transition: all 0.3s ease;
  text-decoration: none;
  animation: pulse 2s infinite;
}

.whatsapp-float:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 40px rgba(37, 211, 102, 0.5);
}

.whatsapp-float:hover .wa-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.wa-icon {
  width: 32px;
  height: 32px;
}

.wa-tooltip {
  position: absolute;
  right: 75px;
  background: #333;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(5px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.wa-tooltip::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: #333;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
  }
}

@media (max-width: 768px) {
  .whatsapp-float {
    bottom: 20px;
    right: 20px;
    width: 55px;
    height: 55px;
  }

  .wa-icon {
    width: 28px;
    height: 28px;
  }

  .wa-tooltip {
    display: none;
  }
}
</style>
