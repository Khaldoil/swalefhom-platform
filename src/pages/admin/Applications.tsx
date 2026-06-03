import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, XCircle, Clock, Eye, Send, Download,
  Search, Filter, User, Mail, Phone, MapPin, GraduationCap,
  Calendar, RefreshCw, X, AlertCircle, UserCheck, Users
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { exportToCSV } from '../../lib/export-utils';

/* ── Types ── */
interface Application {
  id: string; name: string; email: string; mobile: string;
  city: string; age?: number; education?: string; motivation?: string;
  contribution?: string; status: 'pending' | 'approved' | 'rejected';
  created_at: string; notes?: string;
}

/* ── Constants ── */
const STATUS_CFG = {
  pending:  { label: 'قيد المراجعة', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
  approved: { label: 'مقبول',        color: 'text-green-400',  bg: 'bg-green-400/10',  icon: CheckCircle },
  rejected: { label: 'مرفوض',        color: 'text-red-400',    bg: 'bg-red-400/10',    icon: XCircle },
};

const EDU_LABELS: Record<string, string> = {
  high_school: 'ثانوية عامة', diploma: 'دبلوم', bachelors: 'بكالوريوس',
  masters: 'ماجستير', phd: 'دكتوراه',
};

/* ── Status Badge ── */
function StatusBadge({ status }: { status: Application['status'] }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, count, color }: { icon: React.ElementType; label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#0A1B26] border border-white/8 rounded-xl px-4 py-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-white">{count}</p>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected'>('approved');
  const [adminNote, setAdminNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_applications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setApplications((data || []) as Application[]);
    } catch (err) {
      console.error(err); addToast('حدث خطأ أثناء تحميل الطلبات', 'error');
    } finally { setIsLoading(false); }
  }, [addToast]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  /* Derived */
  const filtered = applications.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      (!selectedStatus || a.status === selectedStatus) &&
      (!q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.city.toLowerCase().includes(q))
    );
  });

  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  /* Handlers */
  const handleStatusChange = async (app: Application, status: 'approved' | 'rejected', note?: string) => {
    setIsSending(true);
    try {
      const { error } = await supabase.from('ambassador_applications').update({ status, notes: note || null }).eq('id', app.id);
      if (error) throw error;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/notify-ambassador-decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
          body: JSON.stringify({ application: app, status, adminNote: note || '' }),
        });
        addToast(
          res.ok ? `تم ${status === 'approved' ? 'قبول' : 'رفض'} الطلب وإرسال الإشعار` : 'تم تحديث الحالة ولكن فشل إرسال الإشعار',
          res.ok ? 'success' : 'warning'
        );
      } catch { addToast('تم التحديث ولكن فشل إرسال الإشعار', 'warning'); }

      load();
    } catch (err) { console.error(err); addToast('حدث خطأ أثناء التحديث', 'error'); }
    finally { setIsSending(false); }
  };

  const handleDecisionSubmit = async () => {
    if (!selectedApp) return;
    await handleStatusChange(selectedApp, decisionType, adminNote);
    setShowDecision(false); setShowDetails(false);
  };

  const openDecision = (app: Application, type: 'approved' | 'rejected') => {
    setSelectedApp(app); setDecisionType(type); setAdminNote(''); setShowDecision(true);
  };

  const handleExport = () => {
    exportToCSV(applications.map(a => ({
      'الاسم': a.name, 'البريد': a.email, 'الجوال': a.mobile,
      'المدينة': a.city, 'الحالة': STATUS_CFG[a.status].label,
      'تاريخ التقديم': new Date(a.created_at).toLocaleDateString('ar-SA'),
    })), 'ambassador_applications');
    addToast('تم تصدير الطلبات', 'success');
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5 pb-8" dir="rtl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">طلبات السفراء</h1>
          <p className="text-gray-500 text-sm mt-0.5">{counts.total} طلب إجمالاً</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white text-sm transition-all">
            <Download className="w-4 h-4" />تصدير
          </button>
          <button onClick={load} className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users}       label="الإجمالي"       count={counts.total}    color="#FAC39B" />
        <StatCard icon={Clock}       label="قيد المراجعة"   count={counts.pending}  color="#FBBF24" />
        <StatCard icon={UserCheck}   label="مقبول"          count={counts.approved} color="#34D399" />
        <StatCard icon={XCircle}     label="مرفوض"          count={counts.rejected} color="#F87171" />
      </div>

      {/* ── Pending Alert ── */}
      {counts.pending > 0 && (
        <div className="flex items-center gap-3 bg-yellow-400/8 border border-yellow-400/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">
            يوجد <strong>{counts.pending}</strong> طلب بانتظار المراجعة
          </p>
          <button onClick={() => setSelectedStatus('pending')} className="mr-auto text-xs text-yellow-400 hover:text-yellow-300 underline">
            عرضها فقط
          </button>
        </div>
      )}

      {/* ── Search & Filter ── */}
      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو المدينة..."
              className="w-full bg-white/5 border border-white/8 text-white rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition-all ${showFilters ? 'bg-[#FAC39B]/10 border-[#FAC39B]/30 text-[#FAC39B]' : 'bg-white/5 border-white/8 text-gray-400 hover:text-white'}`}>
            <Filter className="w-4 h-4" />تصفية
          </button>
          {(searchQuery || selectedStatus) && (
            <button onClick={() => { setSearchQuery(''); setSelectedStatus(null); }} className="p-2.5 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {showFilters && (
          <div className="pt-3 border-t border-white/8">
            <p className="text-xs text-gray-500 mb-2 font-medium">الحالة</p>
            <div className="flex gap-2">
              {Object.entries(STATUS_CFG).map(([id, cfg]) => (
                <button key={id} onClick={() => setSelectedStatus(selectedStatus === id ? null : id)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedStatus === id ? `${cfg.bg} ${cfg.color}` : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Cards Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{searchQuery || selectedStatus ? 'لا توجد نتائج' : 'لا توجد طلبات بعد'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all flex flex-col gap-4">
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAC39B]/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#FAC39B]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{app.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-600" />
                      <span className="text-gray-500 text-xs">{app.city}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <a href={`mailto:${app.email}`} className="text-xs text-gray-400 hover:text-[#FAC39B] transition-colors truncate">{app.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <span className="text-xs text-gray-400">{app.mobile}</span>
                </div>
                {app.education && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                    <span className="text-xs text-gray-400">{EDU_LABELS[app.education] || app.education}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <span className="text-xs text-gray-500">
                    {new Date(app.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Motivation preview */}
              {app.motivation && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed border-t border-white/5 pt-3">
                  {app.motivation}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                <button onClick={() => { setSelectedApp(app); setShowDetails(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-white/8 text-gray-300 rounded-xl text-xs hover:bg-white/10 hover:text-white transition-all">
                  <Eye className="w-3.5 h-3.5" />التفاصيل
                </button>
                {app.status === 'pending' && (
                  <>
                    <button onClick={() => openDecision(app, 'approved')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs hover:bg-green-500/20 transition-all">
                      <CheckCircle className="w-3.5 h-3.5" />قبول
                    </button>
                    <button onClick={() => openDecision(app, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs hover:bg-red-500/20 transition-all">
                      <XCircle className="w-3.5 h-3.5" />رفض
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Details Modal ── */}
      {showDetails && selectedApp && (
        <Modal isOpen={true} onClose={() => setShowDetails(false)} title="تفاصيل الطلب">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FAC39B]/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#FAC39B]" />
                </div>
                <div>
                  <p className="text-white font-bold">{selectedApp.name}</p>
                  <p className="text-gray-400 text-xs">{selectedApp.city}</p>
                </div>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'البريد الإلكتروني', value: selectedApp.email, icon: Mail },
                { label: 'رقم الجوال', value: selectedApp.mobile, icon: Phone },
                { label: 'المدينة', value: selectedApp.city, icon: MapPin },
                { label: 'العمر', value: selectedApp.age ? `${selectedApp.age} سنة` : '—', icon: User },
                { label: 'المؤهل', value: EDU_LABELS[selectedApp.education || ''] || '—', icon: GraduationCap },
                { label: 'تاريخ التقديم', value: new Date(selectedApp.created_at).toLocaleDateString('ar-SA'), icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/3 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-gray-600" />
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                  <p className="text-sm text-white">{value}</p>
                </div>
              ))}
            </div>

            {selectedApp.motivation && (
              <div className="bg-white/3 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">الدافع للتقديم</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedApp.motivation}</p>
              </div>
            )}
            {selectedApp.contribution && (
              <div className="bg-white/3 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">المساهمة المتوقعة</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedApp.contribution}</p>
              </div>
            )}
            {selectedApp.notes && (
              <div className="bg-white/3 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-gray-500 mb-2">ملاحظات الإدارة</p>
                <p className="text-sm text-gray-300">{selectedApp.notes}</p>
              </div>
            )}

            {selectedApp.status === 'pending' && (
              <div className="flex gap-3 pt-2 border-t border-white/8">
                <button onClick={() => { setShowDetails(false); openDecision(selectedApp, 'approved'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/20 transition-all">
                  <CheckCircle className="w-4 h-4" />قبول الطلب
                </button>
                <button onClick={() => { setShowDetails(false); openDecision(selectedApp, 'rejected'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-all">
                  <XCircle className="w-4 h-4" />رفض الطلب
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Decision Modal ── */}
      {showDecision && selectedApp && (
        <Modal isOpen={true} onClose={() => setShowDecision(false)}
          title={decisionType === 'approved' ? '✅ قبول الطلب' : '❌ رفض الطلب'}>
          <div className="space-y-5">
            <div className={`p-4 rounded-xl border ${decisionType === 'approved' ? 'bg-green-500/8 border-green-500/20' : 'bg-red-500/8 border-red-500/20'}`}>
              <p className="text-white text-sm mb-1">
                {decisionType === 'approved' ? 'قبول' : 'رفض'} طلب: <strong>{selectedApp.name}</strong>
              </p>
              <p className="text-gray-400 text-xs">سيُرسل إشعار بريدي إلى: {selectedApp.email}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-2">
                رسالة للمتقدم (اختياري)
              </label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={4}
                placeholder={decisionType === 'approved'
                  ? 'مرحباً بك في فريق سفراء سواليفهم...'
                  : 'سبب الرفض أو إرشادات للتقديم مستقبلاً...'}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 resize-none transition-all" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleDecisionSubmit} disabled={isSending}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                  decisionType === 'approved'
                    ? 'bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25'
                    : 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
                }`}>
                {isSending ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                {isSending ? 'جاري الإرسال...' : `${decisionType === 'approved' ? 'قبول' : 'رفض'} وإرسال إشعار`}
              </button>
              <button onClick={() => setShowDecision(false)} disabled={isSending}
                className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
