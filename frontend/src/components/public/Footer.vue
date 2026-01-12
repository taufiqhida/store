<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-payments">
        <span class="payment-logo">📱 QRIS</span>
        <span class="payment-logo">💚 GoPay</span>
        <span class="payment-logo">💜 OVO</span>
        <span class="payment-logo">💙 DANA</span>
      </div>
      <p class="footer-copyright">© {{ new Date().getFullYear() }} {{ storeName }}. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  storeName: String
})
</script>

<style scoped>
.footer {
  background: #000;
  color: white;
  padding: 40px 0;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-payments {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.payment-logo {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-weight: 500;
}

.footer-copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}
</style>
