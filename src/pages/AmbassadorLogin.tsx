import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Input from '../components/Input';
import Footer from '../components/Footer';

export default function AmbassadorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        navigate('/ambassador/dashboard');
      }
    } catch (err: any) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2837] pt-24">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">تسجيل دخول السفراء</h1>
          <p className="text-[#FAC39B]">أهلاً بك في منصة سفراء التراث</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <Input
              type="email"
              label="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              required
            />

            <Input
              type="password"
              label="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              <Lock className="w-5 h-5 ml-2" />
              تسجيل الدخول
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-gray-400">
            ليس لديك حساب؟{' '}
            <button
              onClick={() => navigate('/apply')}
              className="text-[#FAC39B] hover:text-white transition-colors"
            >
              قدم طلبك الآن
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}