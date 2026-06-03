import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LIMITS } from '../lib/constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// قائمة الإيميلات المصرح لها بالوصول للوحة الإدارة
// يمكن استبدالها بنظام roles في Supabase لاحقاً
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim()).filter(Boolean);

function checkIsAdmin(user: User | null): boolean {
  if (!user) return false;
  // فحص user_metadata أولاً
  if (user.user_metadata?.role === 'admin') return true;
  // فحص قائمة الإيميلات
  if (ADMIN_EMAILS.length > 0 && user.email && ADMIN_EMAILS.includes(user.email)) return true;
  // fallback: أي مستخدم مسجل يُعتبر admin (للتوافق مع الإعداد الحالي)
  // احذف هذا السطر عند إعداد VITE_ADMIN_EMAILS في بيئة الإنتاج
  return ADMIN_EMAILS.length === 0;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Session timeout
  const sessionTimeoutMs = LIMITS.SESSION_TIMEOUT_MINUTES * 60 * 1000;
  let sessionTimer: ReturnType<typeof setTimeout> | null = null;

  const resetSessionTimer = useCallback(() => {
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(async () => {
      await supabase.auth.signOut();
    }, sessionTimeoutMs);
  }, [sessionTimeoutMs]);

  useEffect(() => {
    // فحص الجلسة الأولية
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(checkIsAdmin(currentUser));
      setLoading(false);
      if (currentUser) resetSessionTimer();
    });

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(checkIsAdmin(currentUser));
      setLoading(false);
      if (currentUser) resetSessionTimer();
      else if (sessionTimer) clearTimeout(sessionTimer);
    });

    // إعادة تعيين المؤقت عند تفاعل المستخدم
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(e => document.addEventListener(e, resetSessionTimer, { passive: true }));

    return () => {
      subscription.unsubscribe();
      activityEvents.forEach(e => document.removeEventListener(e, resetSessionTimer));
      if (sessionTimer) clearTimeout(sessionTimer);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (sessionTimer) clearTimeout(sessionTimer);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    // التحقق من كلمة المرور الحالية أولاً
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });
    if (signInError) throw new Error('كلمة المرور الحالية غير صحيحة');

    if (newPassword.length < LIMITS.MIN_PASSWORD_LENGTH) {
      throw new Error(`كلمة المرور يجب أن تكون ${LIMITS.MIN_PASSWORD_LENGTH} أحرف على الأقل`);
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut, updatePassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
