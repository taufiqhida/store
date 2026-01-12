import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import RootApp from './RootApp.vue'
import App from './App.vue'
import AdminLogin from './views/AdminLogin.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import ArticleList from './views/ArticleList.vue'
import ArticleDetail from './views/ArticleDetail.vue'

// Create router
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: App },
        { path: '/admin', component: AdminLogin },
        { path: '/admin/dashboard', component: AdminDashboard },
        { path: '/artikel', component: ArticleList },
        { path: '/artikel/:slug', component: ArticleDetail }
    ]
})

// Create app with router
const app = createApp(RootApp)
app.use(router)
app.mount('#app')

