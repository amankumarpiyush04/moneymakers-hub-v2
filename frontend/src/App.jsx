import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/useAuthStore';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Core Pages
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordPages';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccess from './pages/OrderSuccess';

// Dashboard Pages
import DashboardLibrary from './pages/dashboard/DashboardLibrary';
import DashboardOrders from './pages/dashboard/DashboardOrders';
import DashboardProfile from './pages/dashboard/DashboardProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

// Main Layout Wrapper
const LayoutWrapper = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-black text-white">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
    <CartDrawer />
  </div>
);

// Dashboard layout
const DashboardLayout = ({ children }) => (
  <LayoutWrapper>
    <div className="bg-black text-white flex-grow">
      <nav className="bg-gray-900/60 border-b border-gray-850 px-6 py-4 flex gap-6 text-sm font-medium">
        <Link to="/dashboard/library" className="text-emerald-450 hover:text-emerald-350 transition-colors">Library</Link>
        <Link to="/dashboard/orders" className="text-gray-300 hover:text-white transition-colors">Orders</Link>
        <Link to="/dashboard/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
      </nav>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  </LayoutWrapper>
);

// Admin layout
const AdminLayout = ({ children }) => (
  <LayoutWrapper>
    <div className="bg-black text-white flex-grow">
      <nav className="bg-gray-900/60 border-b border-gray-855 px-6 py-4 flex gap-6 text-sm font-medium">
        <Link to="/admin" className="text-emerald-450 hover:text-emerald-350 transition-colors">Dashboard</Link>
        <Link to="/admin/products" className="text-gray-300 hover:text-white transition-colors">Products</Link>
        <Link to="/admin/orders" className="text-gray-300 hover:text-white transition-colors">Orders</Link>
        <Link to="/admin/users" className="text-gray-300 hover:text-white transition-colors">Users</Link>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  </LayoutWrapper>
);

// Route guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">Loading...</div>;
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();
  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">Loading...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const init = useAuthStore(s => s.init);

  // Boot Supabase auth listener once
  useEffect(() => {
    const unsub = init();
    return unsub;
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '8px', background: '#1f2937', color: '#fff' },
        success: { style: { background: '#064e3b' } },
        error:   { style: { background: '#7f1d1d' } },
      }} />

      <Routes>
        {/* Public Store */}
        <Route path="/"             element={<LayoutWrapper><HomePage /></LayoutWrapper>} />
        <Route path="/browse"       element={<LayoutWrapper><BrowsePage /></LayoutWrapper>} />
        <Route path="/browse/:cat"  element={<LayoutWrapper><BrowsePage /></LayoutWrapper>} />
        <Route path="/ebook/:slug"  element={<LayoutWrapper><ProductPage /></LayoutWrapper>} />
        <Route path="/cart"         element={<LayoutWrapper><CartPage /></LayoutWrapper>} />
        
        {/* Auth Pages (No Navbar/Footer for clean landing) */}
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* Private Checkout */}
        <Route path="/checkout" element={<PrivateRoute><LayoutWrapper><CheckoutPage /></LayoutWrapper></PrivateRoute>} />
        <Route path="/order-success/:id" element={<PrivateRoute><LayoutWrapper><OrderSuccess /></LayoutWrapper></PrivateRoute>} />

        {/* Dashboard */}
        <Route path="/dashboard/library" element={<PrivateRoute><DashboardLayout><DashboardLibrary /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/orders"  element={<PrivateRoute><DashboardLayout><DashboardOrders /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/profile" element={<PrivateRoute><DashboardLayout><DashboardProfile /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard"         element={<Navigate to="/dashboard/library" replace />} />

        {/* Admin */}
        <Route path="/admin"          element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
        <Route path="/admin/orders"   element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users"    element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
