import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, CheckCircle, XCircle, AlertTriangle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

export default function AmbassadorDashboard() {
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/ambassador/login');
        return;
      }

      const { data, error } = await supabase
        .from('ambassador_applications')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      setApplication(data);
    } catch (err) {
      console.error('Error loading application:', err);
      setError('حدث خطأ أثناء تحميل بيانات الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/ambassador/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-red-400" />;
      default:
        return <Clock className="w-8 h-8 text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'تم قبول طلبك';
      case 'rejected':
        return 'تم رفض طلبك';
      default:
        return 'طلبك قيد المراجعة';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0F2837]">
      <div className="flex-grow pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h1>
              <p className="text-[#FAC39B]">مرحباً بك في منصة سفراء التراث</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="w-5 h-5 ml-2" />
              تسجيل الخروج
            </Button>
          </div>

          {error ? (
            <Card>
              <div className="text-center py-8">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">{error}</p>
              </div>
            </Card>
          ) : application ? (
            <div className="space-y-8">
              {/* Status Card */}
              <Card>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {getStatusIcon(application.status)}
                  </div>
                  <div className="flex-grow">
                    <h2 className={`text-xl font-bold ${getStatusColor(application.status)} mb-2`}>
                      {getStatusText(application.status)}
                    </h2>
                    <p className="text-gray-400">
                      تم تقديم الطلب بتاريخ: {new Date(application.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Application Details */}
              <Card>
                <h2 className="text-xl font-bold text-white mb-6">تفاصيل الطلب</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 mb-1">الاسم</p>
                    <p className="text-white">{application.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">البريد الإلكتروني</p>
                    <p className="text-white">{application.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">رقم الجوال</p>
                    <p className="text-white">{application.mobile}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">المدينة</p>
                    <p className="text-white">{application.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">العمر</p>
                    <p className="text-white">{application.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">المؤهل العلمي</p>
                    <p className="text-white">
                      {application.education === 'high_school' && 'ثانوية عامة'}
                      {application.education === 'diploma' && 'دبلوم'}
                      {application.education === 'bachelors' && 'بكالوريوس'}
                      {application.education === 'masters' && 'ماجستير'}
                      {application.education === 'phd' && 'دكتوراه'}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-gray-400 mb-2">الدافع للتقديم</p>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white whitespace-pre-wrap">{application.motivation}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-gray-400 mb-2">المساهمة المتوقعة</p>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white whitespace-pre-wrap">{application.contribution}</p>
                  </div>
                </div>
              </Card>

              {application.status === 'approved' && (
                <Card>
                  <div className="text-center">
                    <Award className="w-16 h-16 text-[#FAC39B] mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-4">مرحباً بك في فريق سفراء التراث</h2>
                    <p className="text-gray-300 mb-6">
                      سنتواصل معك قريباً لتزويدك بالمزيد من المعلومات حول دورك كسفير وكيفية المساهمة في حفظ تراثنا.
                    </p>
                    <Button>
                      <Award className="w-5 h-5 ml-2" />
                      ابدأ رحلتك كسفير
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">لم يتم العثور على طلب مسجل بهذا البريد الإلكتروني</p>
                <Button onClick={() => navigate('/apply')}>
                  تقديم طلب جديد
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}