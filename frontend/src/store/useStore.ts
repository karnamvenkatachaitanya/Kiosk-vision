import { create } from 'zustand'

/* ─── Types ─── */
export type UserRole = 'guest' | 'daily_customer' | 'supervisor' | 'owner'
export type DeliveryType = 'pickup' | 'service_boy' | 'home_delivery'

export interface CartItem {
  product_id: string
  product_name: string
  product_emoji: string
  quantity: number
  unit_price: number
  total_price: number
  added_via: string
}

export interface AppState {
  /* Auth */
  token: string | null
  userId: string | null
  role: UserRole
  userName: string | null
  rewardPoints: number
  isAuthenticated: boolean
  isAuthModalOpen: boolean

  /* Cart */
  cartItems: CartItem[]
  cartTotal: number
  deliveryType: DeliveryType

  /* UI / Accessibility */
  isMobileMenuOpen: boolean
  isVoiceActive: boolean
  isVoiceOverlayOpen: boolean
  isHighContrast: boolean
  isLargeText: boolean
  voiceEnabled: boolean
  gestureEnabled: boolean
  language: string
  ttsSpeed: number

  /* Voice */
  lastTranscript: string
  lastIntent: string

  /* Actions */
  openAuthModal: () => void
  closeAuthModal: () => void
  setAuth: (token: string, userId: string, role: UserRole, name?: string) => void
  logout: () => void
  addToCart: (item: CartItem) => void
  updateQuantity: (productId: string, delta: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  setDeliveryType: (type: DeliveryType) => void
  openVoiceOverlay: () => void
  closeVoiceOverlay: () => void
  toggleVoice: () => void
  toggleHighContrast: () => void
  toggleLargeText: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  setTranscript: (text: string) => void
  setIntent: (intent: string) => void
  setRewardPoints: (pts: number) => void
}

/* ─── Store ─── */
export const useStore = create<AppState>((set, get) => ({
  /* ── Auth ── */
  token: localStorage.getItem('kv_token'),
  userId: localStorage.getItem('kv_uid'),
  role: (localStorage.getItem('kv_role') as UserRole) || 'guest',
  userName: localStorage.getItem('kv_name'),
  rewardPoints: 0,
  isAuthenticated: !!localStorage.getItem('kv_token'),
  isAuthModalOpen: false,

  /* ── Cart ── */
  cartItems: [],
  cartTotal: 0,
  deliveryType: 'pickup',

  /* ── UI ── */
  isMobileMenuOpen: false,
  isVoiceActive: false,
  isVoiceOverlayOpen: false,
  isHighContrast: localStorage.getItem('kv_hc') === '1',
  isLargeText: localStorage.getItem('kv_lt') === '1',
  voiceEnabled: true,
  gestureEnabled: true,
  language: 'en',
  ttsSpeed: 1.0,

  /* ── Voice ── */
  lastTranscript: '',
  lastIntent: '',

  /* ── Actions ── */
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setAuth: (token, userId, role, name) => {
    localStorage.setItem('kv_token', token)
    localStorage.setItem('kv_uid', userId)
    localStorage.setItem('kv_role', role)
    if (name) localStorage.setItem('kv_name', name)
    set({ token, userId, role, userName: name || null, isAuthenticated: true, isAuthModalOpen: false })
  },

  logout: () => {
    localStorage.removeItem('kv_token')
    localStorage.removeItem('kv_uid')
    localStorage.removeItem('kv_role')
    localStorage.removeItem('kv_name')
    set({ token: null, userId: null, role: 'guest', userName: null, isAuthenticated: false, rewardPoints: 0 })
  },

  addToCart: (item) => {
    const items = [...get().cartItems]
    const idx = items.findIndex(i => i.product_id === item.product_id)
    if (idx >= 0) {
      items[idx].quantity += item.quantity
      items[idx].total_price = items[idx].quantity * items[idx].unit_price
    } else {
      items.push({ ...item, total_price: item.quantity * item.unit_price })
    }
    set({ cartItems: items, cartTotal: items.reduce((s, i) => s + i.total_price, 0) })
  },

  updateQuantity: (productId, delta) => {
    let items = [...get().cartItems]
    const idx = items.findIndex(i => i.product_id === productId)
    if (idx >= 0) {
      items[idx].quantity = Math.max(0, items[idx].quantity + delta)
      if (items[idx].quantity === 0) {
        items = items.filter(i => i.product_id !== productId)
      } else {
        items[idx].total_price = items[idx].quantity * items[idx].unit_price
      }
    }
    set({ cartItems: items, cartTotal: items.reduce((s, i) => s + i.total_price, 0) })
  },

  removeFromCart: (pid) => {
    const items = get().cartItems.filter(i => i.product_id !== pid)
    set({ cartItems: items, cartTotal: items.reduce((s, i) => s + i.total_price, 0) })
  },

  clearCart: () => set({ cartItems: [], cartTotal: 0 }),
  setDeliveryType: (type) => set({ deliveryType: type }),
  openVoiceOverlay: () => set({ isVoiceOverlayOpen: true, isVoiceActive: true }),
  closeVoiceOverlay: () => set({ isVoiceOverlayOpen: false, isVoiceActive: false, lastTranscript: '' }),
  toggleVoice: () => set({ isVoiceActive: !get().isVoiceActive }),

  toggleHighContrast: () => {
    const next = !get().isHighContrast
    document.body.classList.toggle('high-contrast', next)
    localStorage.setItem('kv_hc', next ? '1' : '0')
    set({ isHighContrast: next })
  },

  toggleLargeText: () => {
    const next = !get().isLargeText
    document.body.classList.toggle('large-text', next)
    localStorage.setItem('kv_lt', next ? '1' : '0')
    set({ isLargeText: next })
  },

  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  setTranscript: (text) => set({ lastTranscript: text }),
  setIntent: (intent) => set({ lastIntent: intent }),
  setRewardPoints: (pts) => set({ rewardPoints: pts }),
}))
