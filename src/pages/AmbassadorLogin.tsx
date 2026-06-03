import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Input from '../components/Input';
import Footer from '../components/Footer';
import { LIMITS } from '../lib/constants';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 دقائق

export default function AmbassadorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const remainingMinutes = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 60000) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setError('');
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) throw authError;

      if (data.user) {
        setAttempts(0);
        navigate('/ambassador/dashboard');
      }
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setError(`تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة بعد ${LIMITS.SESSION_TIMEOUT_MINUTES / 6} دقائق.`);
      } else {
        setError(`البريد الإلكتروني أو كلمة المرور غير صحيحة. (${MAX_ATTEMPTS - newAttempts} محاولات متبقية)`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('يرجى إدخال بريدك الإلكتروني أولاً');
      emailRef.current?.focus();
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/ambassador/dashboard`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch {
      setError('حدث خطأ أثناء إرسال رابط إعادة التعيين. تأكد من صحة البريد الإلكتروني.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2837] pt-24 pb-16" dir="rtl">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#FAC39B]/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#FAC39B]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'دخول السفراء' : 'استعادة كلمة المرور'}
          </h1>
          <p className="text-gray-400">
            {mode === 'login' ? 'أهلاً بك في منصة سفراء التراث' : 'أدخل بريدك الإلكتروني لاستعادة حسابك'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10">
          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* رسالة الإغلاق */}
          {isLocked && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">الحساب مغلق مؤقتاً لمدة {remainingMinutes} دقيقة</p>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={emailRef as React.RefObject<HTMLInputElement>}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                    disabled={isLocked}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-10 placeholder-gray-500 focus:outline-none focus:border-[#FAC39B]/50 focus:ring-1 focus:ring-[#FAC39B]/30 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    required
                    disabled={isLocked}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-10 pl-10 placeholder-gray-500 focus:outline-none focus:border-[#FAC39B]/50 focus:ring-1 focus:ring-[#FAC39B]/30 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLocked}>
                تسجيل الدخول
              </Button>

              <button
                type="button"
                onClick={() => { setMode('reset'); setError(''); }}
                className="w-full text-center text-sm text-gray-400 hover:text-[#FAC39B] transition-colors"
              >
                نسيت كلمة المرور؟
              </button>
            </form>
          ) : resetSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-medium mb-2">تم إرسال الرابط</h3>
              <p className="text-gray-400 text-sm mb-6">تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور</p>
              <button
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="text-[#FAC39B] hover:text-white transition-colors text-sm"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={emailRef as React.RefObject<HTMLInputElement>}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-10 placeholder-gray-500 focus:outline-none focus:border-[#FAC39B]/50 transition-all"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                إرسال رابط الاستعادة
              </Button>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="w-full text-center text-sm text-gray-400 hover:text-[#FAC39B] transition-colors"
              >
                العودة لتسجيل الدخول
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            لا يوجد لديك حساب؟{' '}
            <button onClick={() => navigate('/apply')} className="text-[#FAC39B] hover:text-white transition-colors">
              قدم طلبك الآن
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
