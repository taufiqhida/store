import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getCategories = () => api.get('/categories');
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getPaymentMethods = () => api.get('/payment-methods');
export const getSettings = () => api.get('/settings');
export const createOrder = (data) => api.post('/orders', data);

// Admin APIs
export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const createProduct = (data) => api.post('/admin/products', data);
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const updateSettings = (data) => api.put('/admin/settings', data);

// Admin Category APIs
export const getAdminCategories = () => api.get('/admin/categories');
export const createCategory = (data) => api.post('/admin/categories', data);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// Admin Payment Method APIs
export const getAdminPaymentMethods = () => api.get('/admin/payment-methods');
export const createPaymentMethod = (data) => api.post('/admin/payment-methods', data);
export const updatePaymentMethod = (id, data) => api.put(`/admin/payment-methods/${id}`, data);
export const deletePaymentMethod = (id) => api.delete(`/admin/payment-methods/${id}`);

// Admin Discount APIs
export const getAdminDiscounts = () => api.get('/admin/discounts');
export const createDiscount = (data) => api.post('/admin/discounts', data);
export const updateDiscount = (id, data) => api.put(`/admin/discounts/${id}`, data);
export const deleteDiscount = (id) => api.delete(`/admin/discounts/${id}`);
export const validateDiscount = (code, productId, subtotal) => api.post('/validate-discount', { code, productId, subtotal });

// Admin Credentials
export const updateAdminCredentials = (data) => api.put('/admin/credentials', data);

// Image Upload
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export default api;
