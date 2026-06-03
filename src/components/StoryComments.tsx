import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  MessageCircle, Send, Heart, Reply, ChevronDown,
  ChevronUp, User, MapPin, Clock, Loader2, AlertCircle,
  CheckCircle, Shield
} from 'lucide-react';

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
  replies?: Comment[];
  isLiked?: boolean;
}

interface StoryCommentsProps {
  storyId: string;
  storyTitle?: string;
}

/* ── Fingerprint (browser identifier without auth) ── */
function getFingerprint(): string {
  const key = 'swlf_fp';
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = `${Date.now()}-${Math.random().toString(36).slice(2)}-${navigator.userAgent.length}`;
    localStorage.setItem(key, fp);
  }
  return fp;
}

/* ── Time formatter ── */
function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  if (h < 24) return `منذ ${h} ساعة`;
  if (d < 30) return `منذ ${d} يوم`;
  return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ── Comment Form ── */
function CommentForm({
  storyId, parentId, parentName, onSuccess, onCancel, placeholder,
}: {
  storyId: string;
  parentId?: string;
  parentName?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (parentId) contentRef.current?.focus();
  }, [parentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    if (content.trim().length < 3) { setError('التعليق قصير جداً'); return; }
    if (content.trim().length > 1000) { setError('التعليق طويل جداً (الحد 1000 حرف)'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const { error: dbError } = await supabase.from('story_comments').insert({
        story_id: storyId,
        parent_id: parentId || null,
        commenter_name: name.trim(),
        commenter_city: city.trim() || null,
        content: content.trim(),
        status: 'pending',
      });
      if (dbError) throw dbError;
      setSubmitted(true);
      setName(''); setCity(''); setContent('');
      setTimeout(() => { setSubmitted(false); onSuccess(); }, 2500);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إرسال التعليق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-start gap-3 bg-green-500/8 border border-green-500/20 rounded-2xl px-5 py-4">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-green-400 font-medium text-sm">تم إرسال تعليقك بنجاح!</p>
          <p className="text-green-500/70 text-xs mt-0.5">سيظهر بعد مراجعته من فريق سواليفهم</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {parentName && (
        <div className="flex items-center gap-2 text-xs text-[#91B9B4] bg-[#91B9B4]/8 border border-[#91B9B4]/15 rounded-xl px-3 py-2">
          <Reply className="w-3.5 h-3.5 flex-shrink-0" />
          <span>رد على <strong>{parentName}</strong></span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">الاسم *</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            placeholder="اسمك" maxLength={60}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/50 focus:bg-white/8 transition-all" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">المدينة</label>
          <input value={city} onChange={e => setCity(e.target.value)}
            placeholder="مدينتك (اختياري)" maxLength={40}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/50 focus:bg-white/8 transition-all" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5 font-medium">
          التعليق * <span className="text-gray-600">({content.length}/1000)</span>
        </label>
        <textarea ref={contentRef} value={content} onChange={e => setContent(e.target.value)}
          required rows={4} maxLength={1000}
          placeholder={placeholder || 'شاركنا رأيك أو ذكرياتك المتعلقة بهذه القصة...'}
          className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/50 focus:bg-white/8 resize-none transition-all leading-relaxed" />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <button type="submit" disabled={isSubmitting || !name.trim() || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FAC39B] text-[#0F2837] rounded-xl font-semibold text-sm hover:bg-[#FF9619] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التعليق'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 text-gray-500 hover:text-white text-sm transition-colors">
            إلغاء
          </button>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mr-auto">
          <Shield className="w-3 h-3" />
          يُراجَع قبل النشر
        </div>
      </div>
    </form>
  );
}

/* ── Single Comment Card ── */
function CommentCard({
  comment, onReply, onLike, depth = 0,
}: {
  comment: Comment;
  onReply: (id: string, name: string) => void;
  onLike: (id: string) => void;
  depth?: number;
}) {
  const [showReplies, setShowReplies] = useState(depth === 0);
  const hasReplies = (comment.replies?.length ?? 0) > 0;
  const isReply = depth > 0;

  return (
    <div className={`${isReply ? 'mr-8 border-r-2 border-[#FAC39B]/15 pr-4' : ''}`}>
      <div className={`group bg-white/3 border border-white/6 rounded-2xl p-4 hover:bg-white/5 hover:border-white/10 transition-all ${isReply ? 'rounded-tr-none' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FAC39B]/20 to-[#91B9B4]/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-[#FAC39B]" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{comment.commenter_name}</p>
              {comment.commenter_city && (
                <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />{comment.commenter_city}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            {timeAgo(comment.created_at)}
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={() => onLike(comment.id)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-all group/like ${
              comment.isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
            }`}>
            <Heart className={`w-3.5 h-3.5 transition-transform group-hover/like:scale-110 ${comment.isLiked ? 'fill-current' : ''}`} />
            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
            {!comment.isLiked && <span>إعجاب</span>}
          </button>

          {depth < 2 && (
            <button onClick={() => onReply(comment.id, comment.commenter_name)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#91B9B4] transition-colors font-medium">
              <Reply className="w-3.5 h-3.5" />
              رد
            </button>
          )}

          {hasReplies && (
            <button onClick={() => setShowReplies(p => !p)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#FAC39B] transition-colors font-medium mr-auto">
              {showReplies
                ? <><ChevronUp className="w-3.5 h-3.5" />إخفاء الردود ({comment.replies!.length})</>
                : <><ChevronDown className="w-3.5 h-3.5" />عرض الردود ({comment.replies!.length})</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && showReplies && (
        <div className="mt-3 space-y-3">
          {comment.replies!.map(reply => (
            <CommentCard key={reply.id} comment={reply} onReply={onReply} onLike={onLike} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function StoryComments({ storyId, storyTitle }: StoryCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const fp = useRef(getFingerprint());
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('story_comments')
        .select('*')
        .eq('story_id', storyId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch liked comments by this fingerprint
      const { data: liked } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('fingerprint', fp.current);
      const likedIds = new Set((liked || []).map((l: { comment_id: string }) => l.comment_id));
      setLikedSet(likedIds);

      // Build tree
      const all = (data || []) as Comment[];
      const map = new Map<string, Comment>();
      all.forEach(c => { map.set(c.id, { ...c, replies: [], isLiked: likedIds.has(c.id) }); });

      const roots: Comment[] = [];
      map.forEach(c => {
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(c);
        } else {
          roots.push(c);
        }
      });

      // Sort roots newest-first, replies oldest-first
      roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      roots.forEach(c => c.replies!.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));

      setComments(roots);
    } catch (err) {
      console.error('Comments load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription for new approved comments
  useEffect(() => {
    const ch = supabase
      .channel(`comments-${storyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'story_comments',
        filter: `story_id=eq.${storyId}`,
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [storyId, load]);

  const handleLike = async (commentId: string) => {
    try {
      const { data } = await supabase.rpc('toggle_comment_like', {
        p_comment_id: commentId,
        p_fingerprint: fp.current,
      });
      if (data) {
        const result = data as { liked: boolean; count: number };
        setLikedSet(prev => {
          const next = new Set(prev);
          result.liked ? next.add(commentId) : next.delete(commentId);
          return next;
        });
        setComments(prev => prev.map(c => {
          if (c.id === commentId) return { ...c, likes_count: result.count, isLiked: result.liked };
          const updatedReplies = c.replies?.map(r =>
            r.id === commentId ? { ...r, likes_count: result.count, isLiked: result.liked } : r
          );
          return { ...c, replies: updatedReplies };
        }));
      }
    } catch (err) { console.error(err); }
  };

  const handleReply = (id: string, name: string) => {
    setReplyTo({ id, name });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleFormSuccess = () => {
    setReplyTo(null);
    setShowForm(false);
    load();
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  return (
    <section className="mt-16 pt-10 border-t border-white/10" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAC39B]/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#FAC39B]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              التعليقات
              {totalCount > 0 && <span className="text-gray-500 text-base font-normal mr-2">({totalCount})</span>}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">شاركنا ذكرياتك وأفكارك حول هذه القصة</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => { setReplyTo(null); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FAC39B]/10 border border-[#FAC39B]/20 text-[#FAC39B] rounded-xl text-sm font-medium hover:bg-[#FAC39B]/20 transition-all">
            <MessageCircle className="w-4 h-4" />أضف تعليقاً
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div ref={formRef} className="mb-8 bg-[#0A1B26] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            {replyTo ? (
              <><Reply className="w-4 h-4 text-[#91B9B4]" />الرد على {replyTo.name}</>
            ) : (
              <><MessageCircle className="w-4 h-4 text-[#FAC39B]" />أضف تعليقاً</>
            )}
          </h3>
          <CommentForm
            storyId={storyId}
            parentId={replyTo?.id}
            parentName={replyTo?.name}
            onSuccess={handleFormSuccess}
            onCancel={() => { setShowForm(false); setReplyTo(null); }}
            placeholder={storyTitle ? `شاركنا ذكرياتك أو تعليقك على "${storyTitle}"...` : undefined}
          />
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">جاري تحميل التعليقات...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-14 bg-white/2 border border-white/5 rounded-2xl">
          <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium mb-1">لا توجد تعليقات بعد</p>
          <p className="text-gray-600 text-xs">كن أول من يشارك ذكرياته حول هذه القصة</p>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAC39B] text-[#0F2837] rounded-xl font-semibold text-sm hover:bg-[#FF9619] transition-all">
              <MessageCircle className="w-4 h-4" />أضف أول تعليق
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </section>
  );
}
