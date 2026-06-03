import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Auto-attach the current Supabase session token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const productsAPI = {
  getAll:      (params) => api.get('/products', { params }),
  getBySlug:   (slug)   => api.get(`/products/${slug}`),
  create:      (data)   => api.post('/products', data),
  update:      (id, data) => api.put(`/products/${id}`, data),
  delete:      (id)     => api.delete(`/products/${id}`),
  uploadCover: (id, file) => {
    const f = new FormData(); f.append('cover', file);
    return api.post(`/products/${id}/cover`, f);
  },
  uploadFile: (id, file) => {
    const f = new FormData(); f.append('ebook', file);
    return api.post(`/products/${id}/file`, f);
  },
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

export const paymentsAPI = {
  createOrder:   (productIds) => api.post('/payments/create-order', { productIds }),
  verifyPayment: (data)       => api.post('/payments/verify', data),
};

export const downloadsAPI = {
  getLibrary: ()          => api.get('/downloads/library'),
  download:   (productId) => api.get(`/downloads/${productId}`),
};

export const usersAPI = {
  getOrders:       ()           => api.get('/users/orders'),
  toggleWishlist:  (productId)  => api.put(`/users/wishlist/${productId}`),
  getProfile:      ()           => api.get('/auth/profile'),
  updateProfile:   (data)       => api.put('/auth/profile', data),
};

export const adminAPI = {
  getStats:       ()       => api.get('/admin/stats'),
  getUsers:       (params) => api.get('/admin/users', { params }),
  getOrders:      (params) => api.get('/admin/orders', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

export default api;
