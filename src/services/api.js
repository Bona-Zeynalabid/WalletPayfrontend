import axios from 'axios';

// Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/wallet';

/* =========================
   AXIOS INSTANCES
========================= */

// 🔒 Private API (requires auth)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// 🌍 Public API (no auth, no cookies)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

/* =========================
   INTERCEPTORS
========================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const currentPath = window.location.pathname;

    console.error('Response error:', error.response?.status, error.response?.data);

    // ✅ Ignore ALL payment-related requests
    if (requestUrl.includes('/payment')) {
      return Promise.reject(error);
    }

    // ✅ Handle auth errors
    if (error.response?.status === 401) {
      const isPublicPath =
        currentPath.startsWith('/pay') || // handles /pay/:id
        currentPath === '/login';

      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/* =========================
   SERVICES
========================= */

// 🔔 Notification Service
export const notificationService = {
  getNotifications: async () => (await api.get('/notifications')).data,
  getUnreadCount: async () => (await api.get('/notifications/unread-count')).data,
  markAsRead: async (id) => (await api.patch(`/notifications/${id}/read`)).data,
  markAllAsRead: async () => (await api.patch('/notifications/read-all')).data,
  deleteNotification: async (id) => (await api.delete(`/notifications/${id}`)).data,
};

// 💳 Card Service
export const cardService = {
  createCard: async (cardHolderName, dailyLimit = 5000) =>
    (await api.post('/card/create', { cardHolderName, dailyLimit })).data,

  getMyCard: async () => (await api.get('/card/my-card')).data,
  getCardDetails: async () => (await api.get('/card/card-details')).data,
  toggleCardStatus: async () => (await api.patch('/card/toggle-status')).data,
  deleteCard: async () => (await api.delete('/card/delete')).data,
};

// 🔑 API Key Service (PRIVATE → uses api)
export const apiKeyService = {
  createApiKey: async (data) =>
    (await api.post('/api-key/create', data)).data,

  getApiKey: async () => (await api.get('/api-key')).data,
  toggleApiKey: async (status) =>
    (await api.patch('/api-key/toggle', { status })).data,
  deleteApiKey: async () => (await api.delete('/api-key')).data,
};

// 🌍 Payment Service (PUBLIC → uses publicApi)
export const paymentService = {
  getSession: async (sessionId) =>
    (await publicApi.get(`/payment/session/${sessionId}`)).data,

  processPayment: async (sessionId, cardData) =>
    (await publicApi.post(`/payment/process/${sessionId}`, cardData)).data,

  // if you need sessions publicly
  getSessions: async () =>
    (await publicApi.get('/payment/sessions')).data,
};

// 🔐 Auth Service
export const authService = {
  login: async (email, password) =>
    (await api.post('/login', { email, password })).data,

  googleAuth: async (credential) =>
    (await api.post('/google', { credential })).data,

  logout: async () => (await api.post('/logout')).data,
  getCurrentUser: async () => (await api.get('/me')).data,
};

// 💰 Wallet Service
export const walletService = {
  getBalance: async () => (await api.get('/my-balance')).data,
  getTransactions: async () => (await api.get('/my-transactions')).data,

  sendMoney: async (toWalletId, amount, description = '') =>
    (await api.post('/send', { toWalletId, amount, description })).data,

  addMoney: async (amount) =>
    (await api.post('/add-money', { amount })).data,
};

// 🌐 Public Service (still private in your case → uses api)
export const publicService = {
  getAllUsers: async () => (await api.get('/users')).data,
  getUserByWalletId: async (id) => (await api.get(`/user/${id}`)).data,
  getBalanceByWalletId: async (id) => (await api.get(`/balance/${id}`)).data,
  getTransactionsByWalletId: async (id) =>
    (await api.get(`/transactions/${id}`)).data,
};

export default api;