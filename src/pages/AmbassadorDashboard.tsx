import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, CheckCircle, XCircle, AlertTriangle, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

interface AmbassadorApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
}

export default function AmbassadorDashboard() {
  const [application, setApplication] = useState<AmbassadorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadApplication = useCallback(async () => {
    try {
      setError(null);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate('/ambassador/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('ambassador_applications')
        .select('id, name, email, mobile, city, status, created_at, notes')
        .eq('email', user.email)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('لم يتم العثور على طلبك. يرجى التأكد من صحة بيانات التسجيل.');
        return;
      }

      setApplication(data);
    } catch (err) {
      console.error('Error loading application:', err);
      setError('حدث خطأ أثناء تحميل بيانات الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/ambassador/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle, label: 'تمت الموافقة' };
      case 'rejected':
        return { color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle, label: 'مرفوض' };
      default:
        return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock, label: 'قيد المراجعة' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F2837] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2837] pt-8 pb-16" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">لوحة السفير</h1>
            <p className="text-gray-400 text-sm">متابعة حالة طلبك</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border border-red-500/20">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {application && (() => {
          const statusInfo = getStatusInfo(application.status);
          const StatusIcon = statusInfo.icon;
          return (
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <div className={`flex items-center gap-4 p-4 rounded-xl ${statusInfo.bg} mb-6`}>
                  <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                  <div>
                    <p className="text-gray-400 text-sm mb-1">حالة الطلب</p>
                    <p className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
                  </div>
                </div>

                {application.status === 'approved' && (
                  <div className="bg-green-400/5 border border-green-400/20 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-400 font-medium mb-1">مبروك! تم قبول طلبك</p>
                        <p className="text-gray-400 text-sm">سيتواصل معك فريق سواليفهم قريباً لإكمال الإجراءات وبدء مهمتك كسفير للتراث.</p>
                      </div>
                    </div>
                  </div>
                )}

                {application.status === 'rejected' && application.notes && (
                  <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4 mb-4">
                    <p className="text-red-400 font-medium mb-1">ملاحظات الإدارة:</p>
                    <p className="text-gray-400 text-sm">{application.notes}</p>
                  </div>
                )}

                {application.status === 'pending' && (
                  <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-400 text-sm">طلبك قيد المراجعة. سنتواصل معك خلال 3-5 أيام عمل.</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Application Details */}
              <Card>
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-5 h-5 text-[#FAC39B]" />
                  <h2 className="text-white font-semibold">بيانات الطلب</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'الاسم', value: application.name },
                    { label: 'البريد الإلكتروني', value: application.email },
                    { label: 'رقم الجوال', value: application.mobile },
                    { label: 'المدينة', value: application.city },
                    { label: 'تاريخ التقديم', value: new Date(application.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">{label}</p>
                      <p className="text-white text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          );
        })()}
      </div>
      <Footer />
    </div>
  );
}
