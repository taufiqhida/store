<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getArticles } from '../services/api'

const router = useRouter()
const articles = ref([])
const loading = ref(true)

// Pagination
const currentPage = ref(1)
const articlesPerPage = 9

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * articlesPerPage
  return articles.value.slice(start, start + articlesPerPage)
})

const totalPages = computed(() => Math.ceil(articles.value.length / articlesPerPage))

const fetchArticles = async () => {
  try {
    const res = await getArticles()
    articles.value = res.data.filter(a => a.isPublished === 1 || a.isPublished === true)
  } catch (error) {
    console.error('Error fetching articles:', error)
  } finally {
    loading.value = false
  }
}

const goToArticle = (slug) => {
  router.push(`/artikel/${slug}`)
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

onMounted(fetchArticles)
</script>

<template>
  <div class="articles-page">
    <!-- Header -->
    <header class="articles-header">
      <div class="header-content">
        <button class="back-btn" @click="goHome">← Kembali</button>
        <h1>📰 Artikel & Tips</h1>
        <p>Baca artikel menarik seputar produk digital</p>
      </div>
    </header>

    <!-- Articles List -->
    <main class="articles-main">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Memuat artikel...</p>
      </div>
      
      <div v-else-if="articles.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <h2>Belum ada artikel</h2>
        <p>Artikel akan segera hadir!</p>
      </div>

      <div v-else class="articles-grid">
        <article 
          v-for="article in paginatedArticles" 
          :key="article.id" 
          class="article-card"
          @click="goToArticle(article.slug)"
        >
          <div class="article-image">
            <img v-if="article.image" :src="article.image" :alt="article.title" />
            <div v-else class="placeholder-image">📰</div>
          </div>
          <div class="article-content">
            <h2>{{ article.title }}</h2>
            <p class="article-excerpt">{{ article.content.substring(0, 150) }}...</p>
            <div class="article-meta">
              <span class="date">📅 {{ formatDate(article.createdAt) }}</span>
              <span class="read-more">Baca selengkapnya →</span>
            </div>
          </div>
        </article>
      </div>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">← Sebelumnya</button>
        <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">Selanjutnya →</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.articles-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  color: #fff;
}

.articles-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  text-align: center;
}

.header-content h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.header-content p {
  opacity: 0.9;
}

.back-btn {
  position: absolute;
  left: 1rem;
  top: 1rem;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: rgba(255,255,255,0.3);
}

.articles-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .empty-state {
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

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.article-card {
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(255,255,255,0.1);
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.article-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.article-content {
  padding: 1.5rem;
}

.article-content h2 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.article-excerpt {
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.date {
  color: rgba(255,255,255,0.5);
}

.read-more {
  color: #667eea;
  font-weight: 500;
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .back-btn {
    position: static;
    margin-bottom: 1rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 2rem;
  padding: 1rem;
}

.page-btn {
  padding: 10px 20px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #667eea;
  border-color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
}
</style>
