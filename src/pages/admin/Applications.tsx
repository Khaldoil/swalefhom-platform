import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, Eye, Mail, Send } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected'>('approved');
  const [adminNote, setAdminNote] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      addToast('حدث خطأ أثناء تحميل الطلبات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (application: any, newStatus: 'approved' | 'rejected', note?: string) => {
    setIsSendingNotification(true);
    try {
      const { error } = await supabase
        .from('ambassador_applications')
        .update({ status: newStatus })
        .eq('id', application.id);

      if (error) throw error;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      try {
        const notificationResponse = await fetch(`${supabaseUrl}/functions/v1/notify-ambassador-decision`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            application,
            status: newStatus,
            adminNote: note || ''
          }),
        });

        if (!notificationResponse.ok) {
          console.error('Failed to send notification');
          addToast('تم تحديث الحالة ولكن فشل إرسال الإشعار', 'warning');
        } else {
          addToast(`تم ${newStatus === 'approved' ? 'قبول' : 'رفض'} الطلب وإرسال الإشعار بنجاح`, 'success');
        }
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
        addToast('تم تحديث الحالة ولكن فشل إرسال الإشعار', 'warning');
      }

      loadApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      addToast('حدث خطأ أثناء تحديث حالة الطلب', 'error');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const openDecisionModal = (application: any, type: 'approved' | 'rejected') => {
    setSelectedApplication(application);
    setDecisionType(type);
    setAdminNote('');
    setShowDecisionModal(true);
  };

  const handleDecisionSubmit = async () => {
    if (selectedApplication) {
      await handleStatusChange(selectedApplication, decisionType, adminNote);
      setShowDecisionModal(false);
      setShowDetailsModal(false);
    }
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm">مقبول</span>;
      case 'rejected':
        return <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm">مرفوض</span>;
      default:
        return <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm">قيد المراجعة</span>;
    }
  };

  const ApplicationDetailsModal = ({ application, onClose }: { application: any; onClose: () => void }) => (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="تفاصيل الطلب"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">الاسم</p>
            <p className="text-white">{application.name}</p>
          </div>
          <div>
            <p className="text-gray-400">العمر</p>
            <p className="text-white">{application.age} سنة</p>
          </div>
          <div>
            <p className="text-gray-400">المدينة</p>
            <p className="text-white">{application.city}</p>
          </div>
          <div>
            <p className="text-gray-400">المؤهل العلمي</p>
            <p className="text-white">
              {application.education === 'high_school' && 'ثانوية عامة'}
              {application.education === 'diploma' && 'دبلوم'}
              {application.education === 'bachelors' && 'بكالوريوس'}
              {application.education === 'masters' && 'ماجستير'}
              {application.education === 'phd' && 'دكتوراه'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">البريد الإلكتروني</p>
            <button 
              onClick={() => handleEmailClick(application.email)}
              className="text-[#FAC39B] hover:text-[#FF9619] transition-colors"
            >
              {application.email}
            </button>
          </div>
          <div>
            <p className="text-gray-400">رقم الجوال</p>
            <p className="text-white">{application.mobile}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-400 mb-2">الدافع للتقديم</p>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white whitespace-pre-wrap">{application.motivation}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-400 mb-2">المساهمة المتوقعة</p>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white whitespace-pre-wrap">{application.contribution}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {application.status === 'pending' && (
            <>
              <Button
                onClick={() => {
                  onClose();
                  openDecisionModal(application, 'approved');
                }}
                className="flex-1"
              >
                <CheckCircle className="w-5 h-5 ml-2" />
                قبول الطلب
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onClose();
                  openDecisionModal(application, 'rejected');
                }}
                className="flex-1"
              >
                <XCircle className="w-5 h-5 ml-2" />
                رفض الطلب
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() => handleEmailClick(application.email)}
            className="flex-1"
          >
            <Mail className="w-5 h-5 ml-2" />
            مراسلة المتقدم
          </Button>
        </div>
      </div>
    </Modal>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">طلبات السفراء</h1>
          <p className="text-gray-400">إدارة طلبات الانضمام كسفراء للتراث</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <AlertTriangle className="w-6 h-6 text-yellow-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">قيد المراجعة</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {applications.filter(app => app.status === 'pending').length}
          </p>
        </Card>
        <Card>
          <CheckCircle className="w-6 h-6 text-green-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الطلبات المقبولة</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {applications.filter(app => app.status === 'approved').length}
          </p>
        </Card>
        <Card>
          <XCircle className="w-6 h-6 text-red-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الطلبات المرفوضة</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {applications.filter(app => app.status === 'rejected').length}
          </p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <div className="flex gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="ابحث في الطلبات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5 ml-2" />
            تصفية
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div>
              <h3 className="text-white text-sm font-medium mb-2">الحالة</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStatus(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    !selectedStatus
                      ? 'bg-[#FAC39B] text-[#0F2837]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setSelectedStatus('pending')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedStatus === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  قيد المراجعة
                </button>
                <button
                  onClick={() => setSelectedStatus('approved')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedStatus === 'approved'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  مقبول
                </button>
                <button
                  onClick={() => setSelectedStatus('rejected')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedStatus === 'rejected'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  مرفوض
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Applications Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الاسم</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المدينة</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المؤهل</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">تاريخ التقديم</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الحالة</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{application.name}</td>
                    <td className="px-6 py-4 text-white">{application.city}</td>
                    <td className="px-6 py-4 text-white">
                      {application.education === 'high_school' && 'ثانوية عامة'}
                      {application.education === 'diploma' && 'دبلوم'}
                      {application.education === 'bachelors' && 'بكالوريوس'}
                      {application.education === 'masters' && 'ماجستير'}
                      {application.education === 'phd' && 'دكتوراه'}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {new Date(application.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEmailClick(application.email)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          title="مراسلة المتقدم"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openDecisionModal(application, 'approved')}
                              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors text-gray-400 hover:text-green-400"
                              title="قبول الطلب"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openDecisionModal(application, 'rejected')}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                              title="رفض الطلب"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan={6} className="px-6 py-8 text-gray-400">
                    لا توجد طلبات مطابقة لمعايير البحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Decision Modal */}
      {showDecisionModal && selectedApplication && (
        <Modal
          isOpen={true}
          onClose={() => setShowDecisionModal(false)}
          title={decisionType === 'approved' ? 'قبول الطلب' : 'رفض الطلب'}
        >
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${
              decisionType === 'approved'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <p className="text-white mb-2">
                أنت على وشك {decisionType === 'approved' ? 'قبول' : 'رفض'} طلب <strong>{selectedApplication.name}</strong>
              </p>
              <p className="text-gray-400 text-sm">
                سيتم إرسال إشعار بريد إلكتروني تلقائياً للمتقدم مع قرارك.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                ملاحظة للمتقدم (اختياري)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="أضف ملاحظة أو رسالة للمتقدم..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FAC39B] resize-none"
              />
              <p className="text-gray-500 text-xs mt-2">
                {decisionType === 'approved'
                  ? 'مثال: نتطلع للعمل معك ونشكرك على اهتمامك بحفظ التراث'
                  : 'مثال: نشجعك على تطوير مهاراتك والتقديم مرة أخرى في المستقبل'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDecisionSubmit}
                disabled={isSendingNotification}
                className="flex-1"
                variant={decisionType === 'approved' ? 'primary' : 'danger'}
              >
                {isSendingNotification ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="mr-2">جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 ml-2" />
                    {decisionType === 'approved' ? 'قبول وإرسال الإشعار' : 'رفض وإرسال الإشعار'}
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDecisionModal(false)}
                disabled={isSendingNotification}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}