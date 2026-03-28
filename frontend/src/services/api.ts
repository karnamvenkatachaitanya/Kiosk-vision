import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kiosk_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  createSession: (deviceId?: string) =>
    api.post('/auth/qr-session', { device_id: deviceId }),
  login: (phone: string, pin: string) =>
    api.post('/auth/login', { phone, pin }),
  register: (data: { name: string; phone: string; pin: string }) =>
    api.post('/auth/register', { ...data, role: 'daily_customer' }),
  getMe: () => api.get('/auth/users/me'),
}

// Orders API
export const ordersAPI = {
  getCart: () => api.get('/orders/cart'),
  addToCart: (item: { product_id: string; product_name: string; quantity: number; unit_price: number }) =>
    api.post('/orders/cart/add', item),
  clearCart: () => api.delete('/orders/cart/clear'),
  createOrder: (items: any[], notes?: string) =>
    api.post('/orders/orders', { items, notes }),
  getOrders: (limit = 20) => api.get(`/orders/orders?limit=${limit}`),
  generateBill: (orderId: string, method = 'upi') =>
    api.post('/orders/billing/generate', { order_id: orderId, payment_method: method }),
}

// Inventory API
export const inventoryAPI = {
  searchProducts: (q: string) => api.get(`/inventory/products/search?q=${q}`),
  getProduct: (id: string) => api.get(`/inventory/products/${id}`),
  lookupBarcode: (barcode: string) => api.get(`/inventory/products/barcode/${barcode}`),
  getLocation: (id: string) => api.get(`/inventory/products/${id}/location`),
  getCategories: () => api.get('/inventory/categories'),
  listProducts: (category?: string) =>
    api.get(`/inventory/products?limit=200${category ? `&category=${category}` : ''}`),
}

// AI API (Lightweight – STT/TTS handled by Browser Web Speech API)
export const aiAPI = {
  // OCR via backend (Tesseract)
  ocr: (imageBase64: string, mode = 'printed') =>
    api.post('/ai/ocr', { image_base64: imageBase64, mode }),
  ocrShoppingList: (imageBase64: string) =>
    api.post('/ai/ocr/shopping-list', { image_base64: imageBase64, mode: 'handwritten' }),

  // Intent parsing via backend (rule-based, lightweight)
  parseIntent: (text: string) =>
    api.post('/ai/intent', { text }),

  // Barcode decoding via backend (PyZBar)
  decodeBarcode: (imageBase64: string) =>
    api.post('/ai/barcode', { image_base64: imageBase64 }),

  // Browser-based TTS helper (uses pre-cached voices for instant playback)
  speak: (text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 1.05
    // Use voices already loaded by the browser (cached after voiceschanged event)
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en') && !v.localService)
      || voices.find((v) => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred
    window.speechSynthesis.speak(utterance)
  },
}

// Payment API
export const paymentAPI = {
  generateUPIQR: (orderId: string, amount: number) =>
    api.post('/payment/upi-qr', { order_id: orderId, amount }),
  confirmPayment: (orderId: string, method = 'upi') =>
    api.post('/payment/confirm', { order_id: orderId, payment_method: method }),
  getStatus: (orderId: string) =>
    api.get(`/payment/status/${orderId}`),
}

// CRM API
export const crmAPI = {
  getSales: (days = 7) => api.get(`/crm/analytics/sales?days=${days}`),
  getTrending: (days = 7) => api.get(`/crm/analytics/products/trending?days=${days}`),
  getCustomerHistory: (userId: string) => api.get(`/crm/customer/${userId}/history`),
  getDailyReport: (date?: string) =>
    api.get(`/crm/reports/daily${date ? `?date=${date}` : ''}`),
}

export default api
