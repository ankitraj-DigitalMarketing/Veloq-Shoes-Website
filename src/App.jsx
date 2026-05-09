import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/authStore';
import useSmoothScroll from './hooks/useSmoothScroll';

// Layouts
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';

// Customer Pages
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import CollectionPage from './pages/CollectionPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminCustomers from './pages/admin/Customers';
import AdminCollections from './pages/admin/Collections';
import AdminCoupons from './pages/admin/Coupons';
import AdminSettings from './pages/admin/Settings';
import AdminBanners from './pages/admin/Banners';
import AdminTheme from './pages/admin/Theme';
import AdminReviews from './pages/admin/Reviews';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const PageWrapper = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
    {children}
  </motion.div>
);

const ADMIN_EMAIL = 'jaipurankitraj@gmail.com';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && (user?.role !== 'admin' || user?.email !== ADMIN_EMAIL)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function useMetaPixel() {
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/settings/public`)
      .then((r) => r.json())
      .then(({ settings }) => {
        const pixelId = settings?.facebookPixelId;
        if (!pixelId || document.getElementById('fb-pixel')) return;
        const script = document.createElement('script');
        script.id = 'fb-pixel';
        script.innerHTML = `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${pixelId}');fbq('track','PageView');
        `;
        document.head.appendChild(script);
      })
      .catch(() => {});
  }, []);
}

export default function App() {
  const { token, fetchMe } = useAuthStore();
  const location = useLocation();

  useSmoothScroll();
  useMetaPixel();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/products" element={<PageWrapper><ProductListPage /></PageWrapper>} />
          <Route path="/products/:slug" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
          <Route path="/collections/:slug" element={<PageWrapper><CollectionPage /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
          <Route path="/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
          <Route path="/checkout" element={<ProtectedRoute><PageWrapper><CheckoutPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/order-confirmation/:id" element={<ProtectedRoute><PageWrapper><OrderConfirmationPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><PageWrapper><AccountPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><PageWrapper><OrdersPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><PageWrapper><OrderConfirmationPage /></PageWrapper></ProtectedRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="theme" element={<AdminTheme />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
