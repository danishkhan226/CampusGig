import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import PageTitleManager from './components/PageTitleManager';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages for code splitting & faster initial load
const LandingPage          = lazy(() => import('./pages/LandingPage'));
const RegisterPage         = lazy(() => import('./pages/RegisterPage'));
const LoginPage            = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage   = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage    = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage        = lazy(() => import('./pages/DashboardPage'));
const ProfilePage          = lazy(() => import('./pages/ProfilePage'));
const MarketplacePage      = lazy(() => import('./pages/MarketplacePage'));
const CreateServicePage    = lazy(() => import('./pages/CreateServicePage'));
const ServiceDetailPage    = lazy(() => import('./pages/ServiceDetailPage'));
const CheckoutPage         = lazy(() => import('./pages/CheckoutPage'));
const OrderDetailPage      = lazy(() => import('./pages/OrderDetailPage'));
const OrdersListPage       = lazy(() => import('./pages/OrdersListPage'));
const ChatPage             = lazy(() => import('./pages/ChatPage'));
const AdminDashboardPage   = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
              <ScrollToTop />
              <PageTitleManager />
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/"                        element={<LandingPage />} />
                    <Route path="/register"                element={<RegisterPage />} />
                    <Route path="/login"                   element={<LoginPage />} />
                    <Route path="/forgot-password"         element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token"   element={<ResetPasswordPage />} />
                    <Route path="/reset-password"          element={<ResetPasswordPage />} />
                    <Route path="/profile/:id"             element={<ProfilePage />} />

                    {/* Marketplace (public) */}
                    <Route path="/explore"                 element={<MarketplacePage />} />
                    <Route path="/categories"              element={<MarketplacePage />} />
                    <Route path="/services/:id"            element={<ServiceDetailPage />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute><DashboardPage /></ProtectedRoute>
                    } />
                    <Route path="/profile/me" element={
                      <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/services/new" element={
                      <ProtectedRoute><CreateServicePage /></ProtectedRoute>
                    } />
                    <Route path="/services/:id/edit" element={
                      <ProtectedRoute><CreateServicePage /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute><OrdersListPage /></ProtectedRoute>
                    } />
                    <Route path="/orders/checkout/:id" element={
                      <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                      <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/chat" element={
                      <ProtectedRoute><ChatPage /></ProtectedRoute>
                    } />
                    <Route path="/chat/:conversationId" element={
                      <ProtectedRoute><ChatPage /></ProtectedRoute>
                    } />

                    {/* Admin Panel */}
                    <Route path="/admin" element={
                      <AdminRoute><AdminDashboardPage /></AdminRoute>
                    } />

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
