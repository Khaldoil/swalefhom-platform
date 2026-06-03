import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Clock, CheckCircle, XCircle, AlertTriangle, LogOut,
  User, BookOpen, Send, Plus, Eye, MapPin, Calendar,
  TrendingUp, FileText, Star, Phone, Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import { CONTACT } from '../lib/constants';

/* ── Types ── */
interface AmbassadorApplication {
  id: string; name: string; email: string; mobile: string;
  city: string; status: 'pending' | 'approved' | 'rejected';
  created_at: string; notes?: string; motivation?: string;
}

interface Story {
  id: string; title: string; status: string;
  created_at: string; region?: string;
  metadata?: { teller_name?: string };
}

/* ── Helpers ── */
const STATUS_CFG = {
  pending:  { label: 'قيد المراجعة', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: Clock },
  approved: { label: 'تمت الموافقة', color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',   icon: CheckCircle },
  rejected: { label: 'مرفوض',        color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',       icon: XCircle },
};

const STORY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'بانتظار المراجعة', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  published: { label: 'منشورة',           color: 'text-green-400',  bg: 'bg-green-400/10' },
  rejected:  { label: 'مرفوضة',           color: 'text-red-400',    bg: 'bg-red-400/10' },
  pending:   { label: 'بانتظار المراجعة', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
};

/* ── Mini Stat ── */
function MiniStat({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-white/4 rounded-xl p-4 border border-white/8">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* ── Main ── */
export default function AmbassadorDashboard() {
  const [application, setApplication] = useState<AmbassadorApplication | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'submit'>('overview');
  const [submitForm, setSubmitForm] = useState({ title: '', content: '', region: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  const REGIONS = [
    'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'المنطقة الشرقية',
    'القصيم', 'عسير', 'تبوك', 'حائل', 'الحدود الشمالية',
    'جازان', 'نجران', 'الباحة', 'الجوف',
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { navigate('/ambassador/login'); return; }

      /* Application */
      const { data: appData, error: appErr } = await supabase
        .from('ambassador_applications')
        .select('id, name, email, mobile, city, status, created_at, notes, motivation')
        .eq('email', user.email)
        .maybeSingle();
      if (appErr) throw appErr;
      if (!appData) { setError('لم يتم العثور على طلبك.'); return; }
      setApplication(appData);

      /* Stories submitted by this ambassador (match by email in metadata) */
      if (appData.status === 'approved') {
        const { data: storiesData } = await supabase
          .from('stories')
          .select('id, title, status, created_at, region, metadata')
          .order('created_at', { ascending: false })
          .limit(20);
        // filter client-side by teller_email matching user email
        const myStories = (storiesData || []).filter(
          (s: Story) => (s.metadata as Record<string, string> | undefined)?.['teller_email'] === user.email
        );
        setStories(myStories);
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل البيانات.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/ambassador/login');
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title.trim() || !submitForm.content.trim()) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('stories').insert([{
        title: submitForm.title,
        content: submitForm.content,
        region: submitForm.region || null,
        status: 'draft',
        format: 'written',
        story_type: 'real',
        metadata: {
          teller_name: application?.name,
          teller_email: user?.email,
          teller_mobile: application?.mobile,
          source: 'ambassador_dashboard',
        },
      }]);
      if (error) throw error;
      setSubmitSuccess(true);
      setSubmitForm({ title: '', content: '', region: '' });
      setTimeout(() => { setSubmitSuccess(false); setActiveTab('stories'); loadData(); }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F2837] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isApproved = application?.status === 'approved';
  const storyCounts = {
    total: stories.length,
    published: stories.filter(s => s.status === 'published').length,
    pending: stories.filter(s => s.status === 'draft' || s.status === 'pending').length,
    rejected: stories.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#0F2837] pb-16" dir="rtl">

      {/* ── Top Bar ── */}
      <div className="bg-[#0A1B26] border-b border-white/8 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" className="h-7" />
            <span className="text-white text-sm font-medium hidden sm:block">لوحة السفير</span>
          </div>
          <div className="flex items-center gap-3">
            {application && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FAC39B]/15 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#FAC39B]" />
                </div>
                <span className="text-gray-300 text-xs hidden sm:block">{application.name}</span>
              </div>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white text-xs transition-all">
              <LogOut className="w-3.5 h-3.5" />خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {application && (
          <>
            {/* ── Status Banner ── */}
            {(() => {
              const cfg = STATUS_CFG[application.status];
              const Icon = cfg.icon;
              return (
                <div className={`flex items-center gap-4 p-5 rounded-2xl border ${cfg.bg}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                    <Icon className={`w-6 h-6 ${cfg.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">حالة طلب السفارة</p>
                    <p className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</p>
                    {application.status === 'pending' && (
                      <p className="text-xs text-gray-500 mt-1">سنتواصل معك خلال 3-5 أيام عمل</p>
                    )}
                    {application.status === 'approved' && (
                      <p className="text-xs text-gray-400 mt-1">أنت الآن جزء من فريق سفراء سواليفهم 🎉</p>
                    )}
                    {application.status === 'rejected' && application.notes && (
                      <p className="text-xs text-gray-400 mt-1">{application.notes}</p>
                    )}
                  </div>
                  {application.status === 'approved' && (
                    <Award className="w-8 h-8 text-[#FAC39B] opacity-60 flex-shrink-0" />
                  )}
                </div>
              );
            })()}

            {/* ── Tabs (only for approved) ── */}
            {isApproved && (
              <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1">
                {[
                  { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
                  { id: 'stories',  label: `قصصي (${storyCounts.total})`, icon: BookOpen },
                  { id: 'submit',   label: 'إرسال قصة', icon: Plus },
                ].map(tab => (
                  <button key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#FAC39B] text-[#0F2837] font-semibold'
                        : 'text-gray-400 hover:text-white'
                    }`}>
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── TAB: Overview ── */}
            {(!isApproved || activeTab === 'overview') && (
              <div className="space-y-5">

                {/* Stats (approved only) */}
                {isApproved && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MiniStat icon={FileText}    label="إجمالي القصص"         value={storyCounts.total}     color="#FAC39B" />
                    <MiniStat icon={CheckCircle} label="منشورة"               value={storyCounts.published} color="#34D399" />
                    <MiniStat icon={Clock}       label="بانتظار المراجعة"     value={storyCounts.pending}   color="#FBBF24" />
                    <MiniStat icon={Star}        label="نسبة القبول"
                      value={storyCounts.total > 0 ? Math.round((storyCounts.published / storyCounts.total) * 100) : 0}
                      color="#A78BFA" />
                  </div>
                )}

                {/* Profile Card */}
                <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-[#FAC39B]" />
                    <h2 className="text-white font-semibold text-sm">بيانات حسابك</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'الاسم', value: application.name, icon: User },
                      { label: 'البريد الإلكتروني', value: application.email, icon: Mail },
                      { label: 'رقم الجوال', value: application.mobile, icon: Phone },
                      { label: 'المدينة', value: application.city, icon: MapPin },
                      { label: 'تاريخ التسجيل', value: new Date(application.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }), icon: Calendar },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3 bg-white/3 rounded-xl p-3">
                        <Icon className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="text-sm text-white">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps (approved) */}
                {isApproved && (
                  <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5">
                    <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#FAC39B]" />
                      مهمتك كسفير
                    </h2>
                    <div className="space-y-3">
                      {[
                        { step: '١', text: 'اجمع القصص التراثية من كبار السن في منطقتك', done: storyCounts.total > 0 },
                        { step: '٢', text: 'أرسل القصص عبر لوحتك مع تفاصيل الراوي', done: storyCounts.total > 0 },
                        { step: '٣', text: 'تابع حالة قصصك وراجع ملاحظات الإدارة', done: storyCounts.published > 0 },
                      ].map(({ step, text, done }) => (
                        <div key={step} className={`flex items-start gap-3 p-3 rounded-xl ${done ? 'bg-green-400/5 border border-green-400/10' : 'bg-white/3'}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${done ? 'bg-green-400/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
                            {done ? '✓' : step}
                          </span>
                          <p className={`text-sm ${done ? 'text-green-300' : 'text-gray-300'}`}>{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact (pending/rejected) */}
                {!isApproved && (
                  <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5">
                    <h2 className="text-white font-semibold text-sm mb-3">للتواصل مع الفريق</h2>
                    <a href={`https://wa.me/${CONTACT.WHATSAPP.replace('+', '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 hover:bg-green-500/20 transition-all text-sm">
                      <Phone className="w-4 h-4" />
                      تواصل معنا عبر واتساب
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Stories ── */}
            {isApproved && activeTab === 'stories' && (
              <div className="space-y-4">
                {stories.length === 0 ? (
                  <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm mb-4">لم ترسل أي قصة بعد</p>
                    <button onClick={() => setActiveTab('submit')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAC39B] text-[#0F2837] rounded-xl text-sm font-semibold hover:bg-[#FF9619] transition-all">
                      <Plus className="w-4 h-4" />ابدأ بإرسال قصة
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-sm">{stories.length} قصة</p>
                      <button onClick={() => setActiveTab('submit')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAC39B]/10 border border-[#FAC39B]/20 text-[#FAC39B] rounded-lg text-xs hover:bg-[#FAC39B]/20 transition-all">
                        <Plus className="w-3.5 h-3.5" />قصة جديدة
                      </button>
                    </div>
                    <div className="space-y-3">
                      {stories.map(story => {
                        const sc = STORY_STATUS[story.status] ?? STORY_STATUS.draft;
                        return (
                          <div key={story.id} className="bg-[#0A1B26] border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-white/15 transition-all">
                            <div className="w-9 h-9 rounded-lg bg-[#FAC39B]/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-[#FAC39B]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{story.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                {story.region && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />{story.region}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-gray-600">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(story.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.color} flex-shrink-0`}>
                              {sc.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── TAB: Submit Story ── */}
            {isApproved && activeTab === 'submit' && (
              <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Send className="w-4 h-4 text-[#FAC39B]" />
                  <h2 className="text-white font-semibold">إرسال قصة جديدة</h2>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-full bg-green-400/15 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-7 h-7 text-green-400" />
                    </div>
                    <p className="text-white font-semibold mb-1">تم إرسال القصة بنجاح!</p>
                    <p className="text-gray-400 text-sm">ستُراجع القصة من قِبل الفريق وسيتم الإخطار بالنتيجة</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitStory} className="space-y-5">
                    <div>
                      <label className="block text-xs text-gray-400 font-medium mb-2">عنوان القصة *</label>
                      <input value={submitForm.title} onChange={e => setSubmitForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="أدخل عنواناً وصفياً للقصة"
                        required
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-medium mb-2">المنطقة</label>
                      <select value={submitForm.region} onChange={e => setSubmitForm(p => ({ ...p, region: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FAC39B]/40 transition-all appearance-none">
                        <option value="">اختر المنطقة (اختياري)</option>
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-medium mb-2">نص القصة *</label>
                      <textarea value={submitForm.content} onChange={e => setSubmitForm(p => ({ ...p, content: e.target.value }))}
                        placeholder="اكتب القصة بالتفصيل، مع ذكر التسلسل الزمني والتفاصيل المهمة..."
                        required rows={8}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 resize-none transition-all leading-relaxed" />
                      <p className="text-xs text-gray-600 mt-1.5">{submitForm.content.length} حرف</p>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                      <button type="submit" disabled={isSubmitting || !submitForm.title.trim() || !submitForm.content.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#FAC39B] text-[#0F2837] rounded-xl font-semibold text-sm hover:bg-[#FF9619] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                        {isSubmitting ? 'جاري الإرسال...' : 'إرسال القصة'}
                      </button>
                      <button type="button" onClick={() => setSubmitForm({ title: '', content: '', region: '' })}
                        className="px-4 py-2.5 text-gray-500 hover:text-white text-sm transition-all">
                        مسح
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
