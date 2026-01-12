<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticle } from '../services/api'

const router = useRouter()
const route = useRoute()
const article = ref(null)
const loading = ref(true)
const notFound = ref(false)

const fetchArticle = async () => {
  try {
    const slug = route.params.slug
    const res = await getArticle(slug)
    article.value = res.data
  } catch (error) {
    console.error('Error fetching article:', error)
    notFound.value = true
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/artikel')
}

const goHome = () => {
  router.push('/')
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(fetchArticle)
</script>

<template>
  <div class="article-page">
    <!-- Header -->
    <header class="article-header">
      <div class="header-nav">
        <button class="back-btn" @click="goBack">← Artikel</button>
        <button class="home-btn" @click="goHome">🏠 Home</button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Memuat artikel...</p>
    </div>

    <!-- Not Found -->
    <div v-else-if="notFound" class="not-found">
      <span class="icon">🔍</span>
      <h2>Artikel tidak ditemukan</h2>
      <p>Artikel yang Anda cari tidak tersedia.</p>
      <button @click="goBack" class="btn-primary">Kembali ke Daftar Artikel</button>
    </div>

    <!-- Article Content -->
    <main v-else class="article-main">
      <article class="article-container">
        <div v-if="article.image" class="article-hero">
          <img :src="article.image" :alt="article.title" />
        </div>

        <div class="article-body">
          <h1>{{ article.title }}</h1>
          
          <div class="article-meta">
            <span class="date">📅 {{ formatDate(article.createdAt) }}</span>
          </div>

          <div class="article-content" v-html="article.content.replace(/\n/g, '<br>')"></div>

          <div class="article-footer">
            <button @click="goBack" class="btn-secondary">← Artikel Lainnya</button>
            <button @click="goHome" class="btn-primary">🛒 Belanja Sekarang</button>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.article-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  color: #fff;
}

.article-header {
  background: rgba(0,0,0,0.3);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-nav {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

.back-btn, .home-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover, .home-btn:hover {
  background: rgba(255,255,255,0.2);
}

.loading, .not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.not-found .icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.article-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.article-container {
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}

.article-hero img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.article-body {
  padding: 2rem;
}

.article-body h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.article-meta {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.date {
  color: rgba(255,255,255,0.6);
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255,255,255,0.9);
}

.article-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: rgba(255,255,255,0.1);
  color: white;
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .article-body h1 {
    font-size: 1.5rem;
  }
  
  .article-body {
    padding: 1.5rem;
  }
}
</style>
