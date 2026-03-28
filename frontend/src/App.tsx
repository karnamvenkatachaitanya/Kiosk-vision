import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import TopBar from './components/layout/TopBar'
import BottomNav from './components/layout/BottomNav'
import VoiceFAB from './components/voice/VoiceFAB'
import VoiceOverlay from './components/voice/VoiceOverlay'
import AuthModal from './components/auth/AuthModal'

/* ── Guest / Customer Pages ── */
import HomePage from './pages/guest/HomePage'
import BrowsePage from './pages/guest/BrowsePage'
import CartPage from './pages/guest/CartPage'
import CheckoutPage from './pages/guest/CheckoutPage'
import VoicePage from './pages/guest/VoicePage'
import ScanPage from './pages/guest/ScanPage'
import StoreMapPage from './pages/guest/StoreMapPage'
import GesturePage from './pages/guest/GesturePage'
import OrderHistoryPage from './pages/customer/OrderHistoryPage'
import ProfilePage from './pages/customer/ProfilePage'

/* ── Supervisor Pages ── */
import SupervisorHome from './pages/supervisor/SupervisorHome'
import BillingPage from './pages/supervisor/BillingPage'
import InventoryPage from './pages/supervisor/InventoryPage'
import ExpiryAlertsPage from './pages/supervisor/ExpiryAlertsPage'

/* ── Owner Pages ── */
import OwnerHome from './pages/owner/OwnerHome'
import AnalyticsPage from './pages/owner/AnalyticsPage'
import StaffPage from './pages/owner/StaffPage'

import { useEffect } from 'react'

function App() {
  const { role, isHighContrast, isLargeText } = useStore()

  // Restore accessibility on mount
  useEffect(() => {
    if (isHighContrast) document.body.classList.add('high-contrast')
    if (isLargeText) document.body.classList.add('large-text')
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-shell">
        <TopBar />
        <main className="page-content">
          <Routes>
            {/* ── Guest & Customer ── */}
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/voice" element={<VoicePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/map" element={<StoreMapPage />} />
            <Route path="/gesture" element={<GesturePage />} />
            <Route path="/history" element={<OrderHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* ── Supervisor ── */}
            <Route path="/supervisor" element={
              role === 'supervisor' || role === 'owner'
                ? <SupervisorHome /> : <Navigate to="/" />
            } />
            <Route path="/supervisor/billing" element={<BillingPage />} />
            <Route path="/supervisor/inventory" element={<InventoryPage />} />
            <Route path="/supervisor/expiry" element={<ExpiryAlertsPage />} />

            {/* ── Owner ── */}
            <Route path="/owner" element={
              role === 'owner' ? <OwnerHome /> : <Navigate to="/" />
            } />
            <Route path="/owner/analytics" element={<AnalyticsPage />} />
            <Route path="/owner/staff" element={<StaffPage />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <BottomNav />
        <VoiceFAB />
        <VoiceOverlay />
        <AuthModal />
      </div>
    </BrowserRouter>
  )
}

export default App
