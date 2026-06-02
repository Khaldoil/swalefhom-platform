import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { incrementAnalytics } from './lib/supabase';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopOnClick from './components/ScrollToTopOnClick';
import PageTransition from './components/PageTransition';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import PageTracker from './components/PageTracker';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Lazy load pages for better performance
const Stories = lazy(() => import('./pages/Stories'));
const StoryDetails = lazy(() => import('./pages/StoryDetails'));
const Guide = lazy(() => import('./pages/Guide'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Pioneers = lazy(() => import('./pages/Pioneers'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Glossary = lazy(() => import('./pages/Glossary'));
const Library = lazy(() => import('./pages/Library'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Apply = lazy(() => import('./pages/Apply'));
const Ambassador = lazy(() => import('./pages/Ambassador'));
const AmbassadorLogin = lazy(() => import('./pages/AmbassadorLogin'));
const AmbassadorDashboard = lazy(() => import('./pages/AmbassadorDashboard'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminStories = lazy(() => import('./pages/admin/Stories'));
const StoryAnnotations = lazy(() => import('./pages/admin/StoryAnnotations'));
const AdminPioneers = lazy(() => import('./pages/admin/Pioneers'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const AdminBlog = lazy(() => import('./pages/admin/Blog'));
const AdminGlossary = lazy(() => import('./pages/admin/Glossary'));
const AdminBooks = lazy(() => import('./pages/admin/Books'));
const Applications = lazy(() => import('./pages/admin/Applications'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Track page view
    incrementAnalytics('page_view');
  }, [location.pathname]);

  const LoadingFallback = () => (
    <div className="min-h-screen bg-[#0F2837] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          {isAdminRoute ? (
          <Routes>
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="stories" element={<AdminStories />} />
              <Route path="stories/:id/annotations" element={<StoryAnnotations />} />
              <Route path="categories" element={<Categories />} />
              <Route path="pioneers" element={<AdminPioneers />} />
              <Route path="applications" element={<Applications />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="glossary" element={<AdminGlossary />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
        ) : (
          <div className="min-h-screen bg-[#0F2837]" dir="rtl">
            <PageTracker />
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/stories" element={<PageTransition><Stories /></PageTransition>} />
                <Route path="/stories/:id" element={<PageTransition><StoryDetails /></PageTransition>} />
                <Route path="/guide" element={<PageTransition><Guide /></PageTransition>} />
                <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
                <Route path="/pioneers" element={<PageTransition><Pioneers /></PageTransition>} />
                <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
                <Route path="/blog/:id" element={<PageTransition><BlogPost /></PageTransition>} />
                <Route path="/glossary" element={<PageTransition><Glossary /></PageTransition>} />
                <Route path="/library" element={<PageTransition><Library /></PageTransition>} />
                <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
                <Route path="/apply" element={<PageTransition><Apply /></PageTransition>} />
                <Route path="/ambassador" element={<PageTransition><Ambassador /></PageTransition>} />
                <Route path="/ambassador/login" element={<PageTransition><AmbassadorLogin /></PageTransition>} />
                <Route path="/ambassador/dashboard" element={<PageTransition><AmbassadorDashboard /></PageTransition>} />
                <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
                <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
              </Routes>
            </AnimatePresence>
            <ScrollToTop />
            <ScrollToTopOnClick />
          </div>
          )}
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}