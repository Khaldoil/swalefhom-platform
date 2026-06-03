import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle, CheckCircle, XCircle, Trash2, Eye,
  Search, Filter, User, MapPin, Clock, Reply,
  RefreshCw, AlertCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../hooks/useToast';

/* ── Types ── */
interface Comment {
  id: string;
  story_id: string;
  parent_id: string | null;
  commenter_name: string;
  commenter_city?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  created_at: string;
  stories?: { id: string; title: string };
}

/* ── Status config ── */
const STATUS = {
  pending:  { label: 'بانتظار المراجعة', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: AlertCircle },
  approved: { label: 'معتمد',            color: 'text-green-400',  bg: 'bg-green-400/10',  icon: CheckCircle },
  rejected: { label: 'مرفوض',            color: 'text-red-400',    bg: 'bg-red-400/10',    icon: XCircle },
};

function StatusBadge({ status }: { status: Comment['status'] }) {
  const cfg = STATUS[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'الآن';
  if (m < 60) return `${m}د`;
  if (h < 24) return `${h}س`;
  return `${d} يوم`;
}

/* ── Main ── */
export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const { addToast } = useToast();

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('story_comments')
        .select('*, stories(id, title)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setComments((data || []) as Comment[]);
    } catch (err) {
      console.error(err);
      addToast('حدث خطأ أثناء تحميل التعليقات', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('admin-comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'story_comments' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const handleApprove = async (comment: Comment) => {
    setIsUpdating(comment.id);
    try {
      const { error } = await supabase.from('story_comments').update({ status: 'approved', admin_note: adminNote || null }).eq('id', comment.id);
      if (error) throw error;
      addToast('تم اعتماد التعليق ونشره', 'success');
      setShowDetails(false); setAdminNote(''); load();
    } catch { addToast('حدث خطأ أثناء الاعتماد', 'error'); }
    finally { setIsUpdating(null); }
  };

  const handleReject = async (comment: Comment) => {
    setIsUpdating(comment.id);
    try {
      const { error } = await supabase.from('story_comments').update({ status: 'rejected', admin_note: adminNote || null }).eq('id', comment.id);
      if (error) throw error;
      addToast('تم رفض التعليق', 'success');
      setShowDetails(false); setAdminNote(''); load();
    } catch { addToast('حدث خطأ أثناء الرفض', 'error'); }
    finally { setIsUpdating(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا التعليق نهائياً؟')) return;
    try {
      const { error } = await supabase.from('story_comments').delete().eq('id', id);
      if (error) throw error;
      addToast('تم حذف التعليق', 'success');
      setShowDetails(false); load();
    } catch { addToast('حدث خطأ أثناء الحذف', 'error'); }
  };

  const filtered = comments.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (!selectedStatus || c.status === selectedStatus) &&
      (!q || c.commenter_name.toLowerCase().includes(q) || c.content.toLowerCase().includes(q) || (c.stories?.title ?? '').toLowerCase().includes(q))
    );
  });

  const counts = {
    total:    comments.length,
    pending:  comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    rejected: comments.filter(c => c.status === 'rejected').length,
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5 pb-8" dir="rtl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة التعليقات</h1>
          <p className="text-gray-500 text-sm mt-0.5">{counts.total} تعليق إجمالاً</p>
        </div>
        <button onClick={load} className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'الإجمالي',          value: counts.total,    color: '#FAC39B', filter: null },
          { label: 'بانتظار المراجعة', value: counts.pending,  color: '#FBBF24', filter: 'pending' },
          { label: 'معتمدة',            value: counts.approved, color: '#34D399', filter: 'approved' },
          { label: 'مرفوضة',            value: counts.rejected, color: '#F87171', filter: 'rejected' },
        ].map(({ label, value, color, filter }) => (
          <button key={label} onClick={() => setSelectedStatus(selectedStatus === filter ? null : filter)}
            className={`flex items-center gap-3 bg-[#0A1B26] border rounded-xl px-4 py-3 text-right transition-all ${
              selectedStatus === filter ? 'border-white/20 bg-white/5' : 'border-white/8 hover:border-white/15'
            }`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
              <MessageCircle className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Pending Alert */}
      {counts.pending > 0 && selectedStatus !== 'pending' && (
        <div className="flex items-center gap-3 bg-yellow-400/8 border border-yellow-400/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300 text-sm"><strong>{counts.pending}</strong> تعليق بانتظار مراجعتك</p>
          <button onClick={() => setSelectedStatus('pending')} className="mr-auto text-xs text-yellow-400 underline hover:text-yellow-300">عرضها</button>
        </div>
      )}

      {/* Search */}
      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو المحتوى أو القصة..."
              className="w-full bg-white/5 border border-white/8 text-white rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
          </div>
          <button onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition-all ${showFilters ? 'bg-[#FAC39B]/10 border-[#FAC39B]/30 text-[#FAC39B]' : 'bg-white/5 border-white/8 text-gray-400 hover:text-white'}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>
        {showFilters && (
          <div className="pt-3 border-t border-white/8">
            <div className="flex gap-2">
              {[
                { id: null,       label: 'الكل' },
                { id: 'pending',  label: 'بانتظار المراجعة' },
                { id: 'approved', label: 'معتمدة' },
                { id: 'rejected', label: 'مرفوضة' },
              ].map(({ id, label }) => (
                <button key={label} onClick={() => setSelectedStatus(selectedStatus === id ? null : id)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedStatus === id ? 'bg-[#FAC39B]/15 text-[#FAC39B]' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}>{label}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#0A1B26] border border-white/8 rounded-2xl">
          <MessageCircle className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{searchQuery || selectedStatus ? 'لا توجد نتائج' : 'لا توجد تعليقات بعد'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(comment => (
            <div key={comment.id}
              className={`bg-[#0A1B26] border rounded-2xl p-5 hover:border-white/15 transition-all ${
                comment.status === 'pending' ? 'border-yellow-400/20' : 'border-white/8'
              }`}>
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FAC39B]/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#FAC39B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold">{comment.commenter_name}</p>
                      {comment.parent_id && (
                        <span className="flex items-center gap-1 text-xs text-[#91B9B4] bg-[#91B9B4]/10 px-2 py-0.5 rounded-full">
                          <Reply className="w-2.5 h-2.5" />رد
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {comment.commenter_city && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-2.5 h-2.5" />{comment.commenter_city}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-2.5 h-2.5" />{timeAgo(comment.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={comment.status} />
                </div>
              </div>

              {/* Story ref */}
              {comment.stories && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/3 rounded-lg px-3 py-1.5 mb-3">
                  <ChevronRight className="w-3 h-3" />
                  <span>على قصة:</span>
                  <span className="text-[#FAC39B] truncate">{comment.stories.title}</span>
                </div>
              )}

              {/* Content */}
              <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">{comment.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/8">
                <button onClick={() => { setSelectedComment(comment); setAdminNote(''); setShowDetails(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 text-gray-300 rounded-xl text-xs hover:bg-white/10 transition-all">
                  <Eye className="w-3.5 h-3.5" />عرض كامل
                </button>

                {comment.status !== 'approved' && (
                  <button onClick={() => handleApprove(comment)} disabled={isUpdating === comment.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs hover:bg-green-500/20 transition-all disabled:opacity-50">
                    {isUpdating === comment.id ? '...' : <><CheckCircle className="w-3.5 h-3.5" />اعتماد</>}
                  </button>
                )}

                {comment.status !== 'rejected' && (
                  <button onClick={() => handleReject(comment)} disabled={isUpdating === comment.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs hover:bg-red-500/20 transition-all disabled:opacity-50">
                    {isUpdating === comment.id ? '...' : <><XCircle className="w-3.5 h-3.5" />رفض</>}
                  </button>
                )}

                <button onClick={() => handleDelete(comment.id)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all mr-auto">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedComment && (
        <Modal isOpen={true} onClose={() => setShowDetails(false)} title="تفاصيل التعليق">
          <div className="space-y-5">
            {/* Comment info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAC39B]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#FAC39B]" />
                </div>
                <div>
                  <p className="text-white font-bold">{selectedComment.commenter_name}</p>
                  {selectedComment.commenter_city && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{selectedComment.commenter_city}
                    </p>
                  )}
                </div>
              </div>
              <StatusBadge status={selectedComment.status} />
            </div>

            {selectedComment.stories && (
              <div className="bg-white/3 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">القصة</p>
                <p className="text-sm text-[#FAC39B]">{selectedComment.stories.title}</p>
              </div>
            )}

            <div className="bg-white/3 rounded-xl px-4 py-4">
              <p className="text-xs text-gray-500 mb-2">التعليق</p>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{selectedComment.content}</p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-medium mb-2">ملاحظة للأرشيف (اختياري)</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                placeholder="سبب الرفض أو ملاحظة داخلية..."
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 resize-none transition-all" />
            </div>

            <div className="flex gap-3 pt-2 border-t border-white/8">
              {selectedComment.status !== 'approved' && (
                <button onClick={() => handleApprove(selectedComment)} disabled={!!isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-all disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" />اعتماد ونشر
                </button>
              )}
              {selectedComment.status !== 'rejected' && (
                <button onClick={() => handleReject(selectedComment)} disabled={!!isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-50">
                  <XCircle className="w-4 h-4" />رفض
                </button>
              )}
              <button onClick={() => handleDelete(selectedComment.id)}
                className="px-4 py-2.5 bg-red-900/20 border border-red-900/30 text-red-500 rounded-xl text-sm hover:bg-red-900/30 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
