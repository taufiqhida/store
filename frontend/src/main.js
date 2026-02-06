import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import RootApp from './RootApp.vue'

// Create router
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: () => import('./App.vue') },
        { path: '/admin', redirect: '/admin/dashboard' },
        { path: '/admin/login', component: () => import('./views/AdminLogin.vue') },
        { path: '/admin/dashboard', component: () => import('./views/AdminDashboard.vue') },
        { path: '/artikel', component: () => import('./views/ArticleList.vue') },
        { path: '/artikel/:slug', component: () => import('./views/ArticleDetail.vue') },
        { path: '/cek-pesanan', component: () => import('./views/OrderHistory.vue') },
        // 404 catch-all route - must be last
        { path: '/:pathMatch(.*)*', component: () => import('./views/NotFound.vue') }
    ]
})
// Navigation Guard
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('adminToken');

    if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
        if (!isAuthenticated) {
            next('/admin/login');
        } else {
            next();
        }
    } else if (to.path === '/admin/login' && isAuthenticated) {
        next('/admin/dashboard');
    } else {
        next();
    }
});
// Create app with router
const app = createApp(RootApp)
app.use(router)
app.mount('#app')

