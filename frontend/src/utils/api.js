import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  login:          (credentials)    => api.post('/api/auth/login', credentials),
  register:       (userData)       => api.post('/api/auth/register', userData),
  getProfile:     ()               => api.get('/api/auth/profile'),
  changePassword: (data)           => api.put('/api/auth/change-password', data),
  forgotPassword: (email)          => api.post('/api/auth/forgot-password', { email }),
  resetPassword:  (token, newPassword) => api.put(`/api/auth/reset-password/${token}`, { newPassword }),
};

// Admin API methods
export const adminAPI = {
  getStats:            ()                         => api.get('/api/admin/stats'),
  getRevenue:          ()                         => api.get('/api/admin/revenue'),
  getActivityLogs:     ({ category = 'all', page = 1, limit = 50 } = {}) =>
                         api.get(`/api/admin/activity?category=${category}&page=${page}&limit=${limit}`),
  getAllUsers:          ()                         => api.get('/api/admin/users'),
  updateUserRole:      (userId, role)              => api.put(`/api/admin/users/${userId}/role`, { role }),
  deleteUser:          (userId)                    => api.delete(`/api/admin/users/${userId}`),
  getAllRequests:       ()                         => api.get('/api/requests'),
  updateRequestStatus: (requestId, status)        => api.put(`/api/requests/${requestId}/status`, { status }),
  updatePickupStatus:  (requestId, data)          => api.put(`/api/requests/${requestId}/pickup-status`, data),
};

// Booking API methods
export const bookingAPI = {
  create:        (bookingData) => api.post('/api/requests', bookingData),
  getMyBookings: ()            => api.get('/api/requests/my'),
  getById:       (id)          => api.get(`/api/requests/${id}`),
  cancel:        (requestId)   => api.put(`/api/requests/${requestId}/cancel`),
};

// Vehicle API methods
export const vehicleAPI = {
  getAll: () => api.get('/api/vehicles'),
  getById: (id) => api.get(`/api/vehicles/${id}`),
  create: (vehicleData) => api.post('/api/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/api/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/api/vehicles/${id}`),
};

// Category API methods
export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  create: (categoryData) => api.post('/api/categories', categoryData),
};

// Coupon API methods
export const couponAPI = {
  validate: (code, orderAmount) => api.post('/api/coupons/validate', { code, orderAmount }),
  getAll:   ()                  => api.get('/api/coupons'),
  create:   (data)              => api.post('/api/coupons', data),
  toggle:   (id)                => api.put(`/api/coupons/${id}/toggle`),
  delete:   (id)                => api.delete(`/api/coupons/${id}`),
};

// Pricing API
export const pricingAPI = {
  calculate: (vehicleId, startDate, endDate) =>
    api.post('/api/vehicles/pricing', { vehicleId, startDate, endDate }),
};

// Damage Report API
export const damageAPI = {
  create:        (data)       => api.post('/api/damage', data),
  getByBooking:  (bookingId)  => api.get(`/api/damage/booking/${bookingId}`),
  getByVehicle:  (vehicleId)  => api.get(`/api/damage/vehicle/${vehicleId}`),
};

// Maintenance API
export const maintenanceAPI = {
  create:        (data)       => api.post('/api/maintenance', data),
  getByVehicle:  (vehicleId)  => api.get(`/api/maintenance/vehicle/${vehicleId}`),
  update:        (id, data)   => api.put(`/api/maintenance/${id}`, data),
  updateStatus:  (vehicleId, status) => api.put(`/api/maintenance/status/${vehicleId}`, { maintenanceStatus: status }),
  delete:        (id)         => api.delete(`/api/maintenance/${id}`),
};

// Review API methods
export const reviewAPI = {
  create: (data) => api.post('/api/reviews', data),
  getByVehicle: (vehicleId) => api.get(`/api/reviews/vehicle/${vehicleId}`),
  checkReviewed: (bookingId) => api.get(`/api/reviews/check/${bookingId}`),
  deleteReview: (id) => api.delete(`/api/reviews/${id}`),
};

export default api;
