import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 دقائق للأدمن

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) return <Navigate to="/admin" replace />;

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const remainingMinutes = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 60000) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      setAttempts(0);
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setError(`تم تجاوز الحد الأقصى للمحاولات. يرجى المحاولة بعد ${LOCKOUT_MS / 60000} دقائق.`);
      } else {
        setError(`بيانات الدخول غير صحيحة. (${MAX_ATTEMPTS - newAttempts} محاولات متبقية)`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2837] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png"
            alt="سواليفهم"
            className="h-20 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-white">لوحة تحكم سواليفهم</h1>
          <p className="text-gray-400 text-sm mt-1">للمديرين المعتمدين فقط</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl mb-6">
              <Lock className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">الحساب مغلق مؤقتاً لمدة {remainingMinutes} دقيقة</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
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
              <Lock className="w-4 h-4 ml-2" />
              تسجيل الدخول
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
