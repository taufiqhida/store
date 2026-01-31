import { ref, computed } from 'vue'

// Global state untuk permissions
const userPermissions = ref([])
const userRole = ref('')

export function usePermissions() {
    // Load permissions from localStorage
    const loadPermissions = () => {
        const perms = localStorage.getItem('adminPermissions')
        const role = localStorage.getItem('adminRole')

        if (perms) {
            try {
                userPermissions.value = JSON.parse(perms)
            } catch (e) {
                userPermissions.value = []
            }
        }

        if (role) {
            userRole.value = role
        }
    }

    // Initialize permissions
    if (userPermissions.value.length === 0) {
        loadPermissions()
    }

    // Check if user has specific permission
    const hasPermission = (permission) => {
        // Super admin has all permissions
        if (userRole.value === 'SUPER_ADMIN' || userPermissions.value.includes('*')) {
            return true
        }

        return userPermissions.value.includes(permission)
    }

    // Check if user is super admin
    const isSuperAdmin = computed(() => {
        return userRole.value === 'SUPER_ADMIN'
    })

    // Check specific permissions
    const canAccessOrders = computed(() => hasPermission('orders'))
    const canAccessProducts = computed(() => hasPermission('products'))
    const canAccessCategories = computed(() => hasPermission('categories'))
    const canAccessPayments = computed(() => hasPermission('payments'))
    const canAccessDiscounts = computed(() => hasPermission('discounts'))
    const canAccessFlashSales = computed(() => hasPermission('flashsales'))
    const canAccessTestimonials = computed(() => hasPermission('testimonials'))
    const canAccessArticles = computed(() => hasPermission('articles'))
    const canAccessSettings = computed(() => hasPermission('settings'))
    const canAccessAdminUsers = computed(() => hasPermission('admin_users'))

    // Set permissions (called after login)
    const setPermissions = (permissions, role) => {
        userPermissions.value = permissions
        userRole.value = role
        localStorage.setItem('adminPermissions', JSON.stringify(permissions))
        localStorage.setItem('adminRole', role)
    }

    // Clear permissions (called on logout)
    const clearPermissions = () => {
        userPermissions.value = []
        userRole.value = ''
        localStorage.removeItem('adminPermissions')
        localStorage.removeItem('adminRole')
    }

    return {
        userPermissions,
        userRole,
        hasPermission,
        isSuperAdmin,
        canAccessOrders,
        canAccessProducts,
        canAccessCategories,
        canAccessPayments,
        canAccessDiscounts,
        canAccessFlashSales,
        canAccessTestimonials,
        canAccessArticles,
        canAccessSettings,
        canAccessAdminUsers,
        setPermissions,
        clearPermissions,
        loadPermissions
    }
}
