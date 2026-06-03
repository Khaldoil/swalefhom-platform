import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Filter, CreditCard as Edit, Trash2, Eye,
  CheckCircle, XCircle, AlertTriangle, Download,
  Check, Send, Info, Search, Clock, BookOpen, Tag,
  MapPin, User, Calendar, RefreshCw, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createStory, updateStory, deleteStory } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import AddEditStory from './components/AddEditStory';
import DeleteConfirmation from './components/DeleteConfirmation';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/Modal';
import { exportToCSV, prepareStoriesForExport } from '../../lib/export-utils';

/* ── Types ── */
interface Category { id: string; name: string; description: string; icon: string }
interface Story {
  id: string; title: string; content: string; status: string;
  region?: string; category_id?: string; created_at: string;
  metadata?: { teller_name?: string; teller_email?: string; teller_mobile?: string };
  categories?: Category;
}

/* ── Constants ── */
const REGIONS = [
  { id: 'riyadh', name: 'الرياض' }, { id: 'makkah', name: 'مكة المكرمة' },
  { id: 'madinah', name: 'المدينة المنورة' }, { id: 'eastern', name: 'المنطقة الشرقية' },
  { id: 'qassim', name: 'القصيم' }, { id: 'asir', name: 'عسير' },
  { id: 'tabuk', name: 'تبوك' }, { id: 'hail', name: 'حائل' },
  { id: 'northern', name: 'الحدود الشمالية' }, { id: 'jazan', name: 'جازان' },
  { id: 'najran', name: 'نجران' }, { id: 'baha', name: 'الباحة' }, { id: 'jawf', name: 'الجوف' },
];

const STATUS_CONFIG = {
  draft:     { label: 'بانتظار المراجعة', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
  published: { label: 'منشور',            color: 'text-green-400',  bg: 'bg-green-400/10',  icon: CheckCircle },
  rejected:  { label: 'مرفوض',            color: 'text-red-400',    bg: 'bg-red-400/10',    icon: XCircle },
  pending:   { label: 'بانتظار المراجعة', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
};

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

/* ── Stat Pill ── */
function StatPill({ icon: Icon, label, count, color }: { icon: React.ElementType; label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#0A1B26] border border-white/8 rounded-xl px-4 py-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-white">{count}</p>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Stories() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    location.state?.selectedCategory || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'published' | 'rejected'>('published');
  const [adminNote, setAdminNote] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').eq('content_type', 'story').order('display_order');
    setCategories(data || []);
  }, []);

  const loadStories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('stories').select('*, categories(*)').order('created_at', { ascending: false });
      if (error) throw error;
      setStories((data || []) as Story[]);
    } catch (err) {
      console.error(err);
      addToast('حدث خطأ أثناء تحميل القصص', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadStories(); loadCategories(); }, []);

  /* Derived */
  const filteredStories = stories.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (!selectedRegion   || s.region === selectedRegion) &&
      (!selectedStatus   || s.status === selectedStatus) &&
      (!selectedCategory || s.category_id === selectedCategory) &&
      (!q || s.title.toLowerCase().includes(q) || (s.metadata?.teller_name ?? '').toLowerCase().includes(q))
    );
  });

  const counts = {
    total:     stories.length,
    pending:   stories.filter(s => s.status === 'draft' || s.status === 'pending').length,
    published: stories.filter(s => s.status === 'published').length,
    rejected:  stories.filter(s => s.status === 'rejected').length,
  };

  /* Handlers */
  const handleStorySubmit = async (data: Record<string, unknown>) => {
    try {
      if (selectedStory) {
        await updateStory(selectedStory.id, { ...data, user_id: user?.id });
        addToast('تم تحديث القصة بنجاح', 'success');
      } else {
        await createStory({ ...data, user_id: user?.id });
        addToast('تم إضافة القصة بنجاح', 'success');
      }
      loadStories();
      setIsAddEditModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('حدث خطأ أثناء حفظ القصة', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStory) return;
    try {
      await deleteStory(selectedStory.id);
      addToast('تم حذف القصة', 'success');
      loadStories();
      setIsDeleteModalOpen(false);
    } catch (err) { console.error(err); addToast('حدث خطأ أثناء الحذف', 'error'); }
  };

  const openDecisionModal = (story: Story, type: 'published' | 'rejected') => {
    setSelectedStory(story); setDecisionType(type); setAdminNote(''); setShowDecisionModal(true);
  };

  const handleStatusChange = async (story: Story, newStatus: string, note?: string) => {
    setIsSendingNotification(true);
    try {
      await updateStory(story.id, { status: newStatus });
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/notify-story-decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
          body: JSON.stringify({ story, status: newStatus, adminNote: note || '' }),
        });
        addToast(
          res.ok
            ? `تم ${newStatus === 'published' ? 'نشر' : 'رفض'} القصة وإرسال الإشعار`
            : 'تم تحديث الحالة ولكن فشل إرسال الإشعار',
          res.ok ? 'success' : 'warning'
        );
      } catch { addToast('تم تحديث الحالة ولكن فشل إرسال الإشعار', 'warning'); }
      loadStories();
    } catch (err) { console.error(err); addToast('حدث خطأ أثناء تحديث الحالة', 'error'); }
    finally { setIsSendingNotification(false); }
  };

  const handleDecisionSubmit = async () => {
    if (selectedStory) {
      await handleStatusChange(selectedStory, decisionType, adminNote);
      setShowDecisionModal(false); setShowDetailsModal(false);
    }
  };

  const handleSelectAll = () =>
    setSelectedStories(selectedStories.length === filteredStories.length ? [] : filteredStories.map(s => s.id));

  const handleBulkPublish = async () => {
    if (!selectedStories.length) return;
    try {
      await supabase.from('stories').update({ status: 'published', published_at: new Date().toISOString() }).in('id', selectedStories);
      addToast(`تم نشر ${selectedStories.length} قصة`, 'success');
      setSelectedStories([]); loadStories();
    } catch { addToast('حدث خطأ أثناء النشر الجماعي', 'error'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedStories.length || !confirm(`حذف ${selectedStories.length} قصة؟`)) return;
    try {
      await supabase.from('stories').delete().in('id', selectedStories);
      addToast(`تم حذف ${selectedStories.length} قصة`, 'success');
      setSelectedStories([]); loadStories();
    } catch { addToast('حدث خطأ أثناء الحذف الجماعي', 'error'); }
  };

  const handleExportAll = () => {
    exportToCSV(prepareStoriesForExport(stories), 'all_stories');
    addToast('تم تصدير القصص', 'success');
  };

  const clearFilters = () => {
    setSearchQuery(''); setSelectedRegion(null); setSelectedStatus(null); setSelectedCategory(null);
  };
  const hasFilters = !!(searchQuery || selectedRegion || selectedStatus || selectedCategory);

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5 pb-8" dir="rtl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة القصص</h1>
          <p className="text-gray-500 text-sm mt-0.5">{counts.total} قصة إجمالاً</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportAll} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white text-sm transition-all">
            <Download className="w-4 h-4" />تصدير الكل
          </button>
          <button onClick={() => { loadStories(); loadCategories(); }} className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setSelectedStory(null); setIsAddEditModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FAC39B] text-[#0F2837] rounded-xl font-medium hover:bg-[#FF9619] transition-all text-sm">
            <Plus className="w-4 h-4" />إضافة قصة
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill icon={BookOpen}     label="الإجمالي"          count={counts.total}     color="#FAC39B" />
        <StatPill icon={Clock}        label="بانتظار المراجعة"  count={counts.pending}   color="#FBBF24" />
        <StatPill icon={CheckCircle}  label="منشورة"            count={counts.published} color="#34D399" />
        <StatPill icon={XCircle}      label="مرفوضة"            count={counts.rejected}  color="#F87171" />
      </div>

      {/* ── Bulk Actions ── */}
      {selectedStories.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#91B9B4]/10 border border-[#91B9B4]/20 rounded-xl px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-white">
            <Check className="w-4 h-4 text-[#91B9B4]" />
            تم تحديد {selectedStories.length} قصة
          </span>
          <div className="flex gap-2">
            <button onClick={handleBulkPublish} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs hover:bg-green-500/20 transition-all">
              <CheckCircle className="w-3.5 h-3.5" />نشر
            </button>
            <button onClick={() => { exportToCSV(prepareStoriesForExport(stories.filter(s => selectedStories.includes(s.id))), 'selected'); addToast('تم التصدير', 'success'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs hover:bg-blue-500/20 transition-all">
              <Download className="w-3.5 h-3.5" />تصدير
            </button>
            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs hover:bg-red-500/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" />حذف
            </button>
            <button onClick={() => setSelectedStories([])} className="p-1.5 text-gray-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Search & Filter ── */}
      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بعنوان القصة أو اسم الراوي..."
              className="w-full bg-white/5 border border-white/8 text-white rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition-all ${showFilters ? 'bg-[#FAC39B]/10 border-[#FAC39B]/30 text-[#FAC39B]' : 'bg-white/5 border-white/8 text-gray-400 hover:text-white'}`}>
            <Filter className="w-4 h-4" />تصفية
            {hasFilters && <span className="w-2 h-2 rounded-full bg-[#FAC39B]" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 border border-white/8 rounded-xl text-gray-400 hover:text-white text-sm transition-all">
              <X className="w-3.5 h-3.5" />مسح
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/8">
            {/* الحالة */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">الحالة</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'pending').map(([id, cfg]) => (
                  <button key={id} onClick={() => setSelectedStatus(selectedStatus === id ? null : id)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${selectedStatus === id ? `${cfg.bg} ${cfg.color}` : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            {/* المنطقة */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">المنطقة</p>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {REGIONS.map(r => (
                  <button key={r.id} onClick={() => setSelectedRegion(selectedRegion === r.id ? null : r.id)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${selectedRegion === r.id ? 'bg-[#FAC39B]/15 text-[#FAC39B]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
            {/* التصنيف */}
            {categories.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">التصنيف</p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all ${selectedCategory === c.id ? 'bg-[#91B9B4]/15 text-[#91B9B4]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Results Count ── */}
      {hasFilters && (
        <p className="text-xs text-gray-500">
          عرض {filteredStories.length} من {counts.total} قصة
        </p>
      )}

      {/* ── Table ── */}
      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox"
                    checked={selectedStories.length === filteredStories.length && filteredStories.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded accent-[#FAC39B]" />
                </th>
                {['القصة', 'الراوي', 'المنطقة', 'التصنيف', 'التاريخ', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} className="text-right text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStories.length > 0 ? filteredStories.map(story => (
                <tr key={story.id} className={`hover:bg-white/3 transition-colors ${selectedStories.includes(story.id) ? 'bg-[#FAC39B]/3' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedStories.includes(story.id)}
                      onChange={() => setSelectedStories(prev => prev.includes(story.id) ? prev.filter(id => id !== story.id) : [...prev, story.id])}
                      className="w-3.5 h-3.5 rounded accent-[#FAC39B]" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium max-w-[180px] truncate">{story.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-300 max-w-[120px] truncate">{story.metadata?.teller_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {story.region ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        <span className="text-gray-300 text-xs">{REGIONS.find(r => r.id === story.region)?.name || story.region}</span>
                      </div>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {story.categories ? (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        <span className="text-gray-300 text-xs">{story.categories.name}</span>
                      </div>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-400 text-xs">
                        {new Date(story.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={story.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {(story.status === 'draft' || story.status === 'pending') && (
                        <>
                          <button onClick={() => openDecisionModal(story, 'published')}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-500 hover:text-green-400 transition-all" title="نشر">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDecisionModal(story, 'rejected')}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all" title="رفض">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => { setSelectedStory(story); setShowDetailsModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-[#FAC39B]/10 text-gray-500 hover:text-[#FAC39B] transition-all" title="تفاصيل">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigate(`/admin/stories/${story.id}/annotations`)}
                        className="p-1.5 rounded-lg hover:bg-[#91B9B4]/10 text-gray-500 hover:text-[#91B9B4] transition-all" title="تفسيرات">
                        <Info className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedStory(story); setIsAddEditModalOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all" title="تعديل">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedStory(story); setIsDeleteModalOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {hasFilters ? 'لا توجد نتائج لهذا البحث' : 'لا توجد قصص بعد'}
                    </p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="mt-3 text-xs text-[#FAC39B] hover:text-white transition-colors">
                        مسح الفلاتر
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Story Details Modal ── */}
      {showDetailsModal && selectedStory && (
        <Modal isOpen={true} onClose={() => setShowDetailsModal(false)} title="تفاصيل القصة">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-white">{selectedStory.title}</h3>
              <StatusBadge status={selectedStory.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'الراوي', value: selectedStory.metadata?.teller_name },
                { label: 'الجوال', value: selectedStory.metadata?.teller_mobile },
                { label: 'البريد', value: selectedStory.metadata?.teller_email },
                { label: 'المنطقة', value: REGIONS.find(r => r.id === selectedStory.region)?.name },
                { label: 'التصنيف', value: selectedStory.categories?.name },
                { label: 'التاريخ', value: new Date(selectedStory.created_at).toLocaleDateString('ar-SA') },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/3 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-sm text-white">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/3 rounded-xl p-4 max-h-40 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">محتوى القصة</p>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedStory.content}</p>
            </div>
            {(selectedStory.status === 'draft' || selectedStory.status === 'pending') && (
              <div className="flex gap-3 pt-2 border-t border-white/8">
                <button onClick={() => { setShowDetailsModal(false); openDecisionModal(selectedStory, 'published'); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/20 transition-all">
                  <CheckCircle className="w-4 h-4" />نشر القصة
                </button>
                <button onClick={() => { setShowDetailsModal(false); openDecisionModal(selectedStory, 'rejected'); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-all">
                  <XCircle className="w-4 h-4" />رفض القصة
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Decision Modal ── */}
      {showDecisionModal && selectedStory && (
        <Modal isOpen={true} onClose={() => setShowDecisionModal(false)}
          title={decisionType === 'published' ? '✅ نشر القصة' : '❌ رفض القصة'}>
          <div className="space-y-5">
            <div className={`p-4 rounded-xl border ${decisionType === 'published' ? 'bg-green-500/8 border-green-500/20' : 'bg-red-500/8 border-red-500/20'}`}>
              <p className="text-white text-sm mb-1">
                {decisionType === 'published' ? 'نشر' : 'رفض'} قصة: <strong>"{selectedStory.title}"</strong>
              </p>
              {selectedStory.metadata?.teller_email && (
                <p className="text-gray-400 text-xs">
                  سيُرسل إشعار بريدي إلى: {selectedStory.metadata.teller_email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-2">رسالة للراوي (اختياري)</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={4}
                placeholder={decisionType === 'published' ? 'شكراً لمساهمتك في حفظ التراث...' : 'سبب الرفض أو ملاحظات للتحسين...'}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 resize-none transition-all" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleDecisionSubmit} disabled={isSendingNotification}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                  decisionType === 'published'
                    ? 'bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25'
                    : 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
                }`}>
                {isSendingNotification ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                {isSendingNotification ? 'جاري الإرسال...' : (decisionType === 'published' ? 'نشر وإرسال إشعار' : 'رفض وإرسال إشعار')}
              </button>
              <button onClick={() => setShowDecisionModal(false)} disabled={isSendingNotification}
                className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-all disabled:opacity-50">
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add/Edit + Delete ── */}
      <AddEditStory isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleStorySubmit} story={selectedStory} categories={categories} />
      <DeleteConfirmation isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm} itemType="القصة" />
    </div>
  );
}
