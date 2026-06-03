import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F2837] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // فحص صلاحية الأدمن
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0F2837] flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold text-white">غير مصرح لك بالوصول</h1>
        <p className="text-gray-400">هذه الصفحة مخصصة لمديري النظام فقط</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-6 py-2 bg-[#FAC39B] text-[#0F2837] rounded-lg font-medium hover:bg-[#FF9619] transition-colors"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
