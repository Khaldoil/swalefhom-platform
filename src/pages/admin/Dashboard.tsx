import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Users, TrendingUp, Eye, Headphones, Play,
  Download, Activity, Clock, ArrowUp, ArrowDown,
  FileText, UserCheck, Camera, Award, RefreshCw,
  CheckCircle, XCircle, AlertCircle, BarChart2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { exportToCSV } from '../../lib/export-utils';

/* ─────────── Types ─────────── */
interface DashboardStats {
  overview: {
    total_views: number;
    total_reads: number;
    total_listens: number;
    total_watches: number;
    unique_visitors: number;
    avg_duration: number;
  };
  by_content_type: Record<string, {
    views: number; reads: number; listens: number;
    watches: number; unique_visitors: number; avg_duration: number;
  }>;
  daily_trend: Array<{ date: string; views: number; visitors: number; avg_duration: number }>;
  top_content: Array<{ content_type: string; content_id: string; views: number; unique_visitors: number; completion_rate: number }>;
  real_time: { active_sessions: number; recent_views: number };
}

interface QuickStats {
  stories: { total: number; pending: number; published: number; rejected: number };
  ambassadors: { total: number; pending: number; approved: number };
  pioneers: number;
  gallery: number;
}

/* ─────────── Helpers ─────────── */
const fmt = (n: number) => n?.toLocaleString('ar-SA') ?? '0';
const fmtDuration = (s: number) => {
  const m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}د ${sec}ث` : `${sec}ث`;
};
const contentLabel: Record<string, string> = {
  story: 'القصص', pioneer: 'رواد التراث', gallery: 'المعرض',
  blog: 'المدونة', training: 'التدريب', event: 'الفعاليات',
};

/* ─────────── Mini bar chart (pure CSS) ─────────── */
function MiniBar({ value, max, color = '#FAC39B' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ─────────── Sparkline SVG ─────────── */
function Sparkline({ data, color = '#FAC39B' }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

/* ─────────── Stat Card ─────────── */
function StatCard({
  icon: Icon, label, value, sub, color, trend, sparkData,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  color: string; trend?: 'up' | 'down' | 'live'; sparkData?: number[];
}) {
  return (
    <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/15 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend === 'live' && (
          <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            مباشر
          </span>
        )}
        {trend === 'up' && <ArrowUp className="w-4 h-4 text-green-400" />}
        {trend === 'down' && <ArrowDown className="w-4 h-4 text-red-400" />}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {sparkData && sparkData.length > 1 && (
        <div className="mt-auto pt-2 border-t border-white/5">
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  );
}

/* ─────────── Status Pill ─────────── */
function Pill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold" style={{ color }}>{fmt(count)}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

/* ─────────── Main Component ─────────── */
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quick, setQuick] = useState<QuickStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { addToast } = useToast();

  const loadQuickStats = useCallback(async () => {
    try {
      const [storiesRes, ambassadorsRes, pioneersRes, galleryRes] = await Promise.all([
        supabase.from('stories').select('status'),
        supabase.from('ambassador_applications').select('status'),
        supabase.from('storytellers').select('id', { count: 'exact', head: true }),
        supabase.from('gallery_items').select('id', { count: 'exact', head: true }),
      ]);

      const stories = storiesRes.data || [];
      const ambassadors = ambassadorsRes.data || [];

      setQuick({
        stories: {
          total: stories.length,
          pending: stories.filter(s => s.status === 'pending' || s.status === 'draft').length,
          published: stories.filter(s => s.status === 'published').length,
          rejected: stories.filter(s => s.status === 'rejected').length,
        },
        ambassadors: {
          total: ambassadors.length,
          pending: ambassadors.filter(a => a.status === 'pending').length,
          approved: ambassadors.filter(a => a.status === 'approved').length,
        },
        pioneers: pioneersRes.count ?? 0,
        gallery: galleryRes.count ?? 0,
      });
    } catch (err) {
      console.error('Quick stats error:', err);
    }
  }, []);

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats', { days_back: timeRange });
      if (error) throw error;
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Stats error:', err);
      if (!silent) addToast('حدث خطأ أثناء تحميل الإحصائيات', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange, addToast]);

  useEffect(() => {
    loadStats();
    loadQuickStats();
    const interval = setInterval(() => loadStats(true), 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const handleExport = () => {
    if (!stats) return;
    exportToCSV([
      { 'نوع الإحصائية': 'إجمالي المشاهدات', 'العدد': stats.overview.total_views },
      { 'نوع الإحصائية': 'القراءات', 'العدد': stats.overview.total_reads },
      { 'نوع الإحصائية': 'الاستماع', 'العدد': stats.overview.total_listens },
      { 'نوع الإحصائية': 'المشاهدات المرئية', 'العدد': stats.overview.total_watches },
      { 'نوع الإحصائية': 'الزوار الفريدون', 'العدد': stats.overview.unique_visitors },
    ], 'dashboard_stats');
    addToast('تم تصدير الإحصائيات', 'success');
  };

  const trendData = stats?.daily_trend?.slice(-7).map(d => d.views) ?? [];
  const visitorData = stats?.daily_trend?.slice(-7).map(d => d.visitors) ?? [];
  const maxTrend = Math.max(...trendData, 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8" dir="rtl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#FAC39B]/50"
          >
            <option value={7}>7 أيام</option>
            <option value={30}>30 يوم</option>
            <option value={90}>90 يوم</option>
            <option value={365}>سنة</option>
          </select>
          <button
            onClick={() => loadStats(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white text-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-[#FAC39B]/10 border border-[#FAC39B]/20 rounded-xl text-[#FAC39B] hover:bg-[#FAC39B]/15 text-sm transition-all"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
        </div>
      </div>

      {/* ── Quick Content Stats ── */}
      {quick && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* القصص */}
          <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-[#FAC39B]" />
              <span className="text-sm text-gray-400">القصص</span>
            </div>
            <p className="text-3xl font-bold text-white mb-4">{fmt(quick.stories.total)}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-500 flex-1">بانتظار المراجعة</span>
                <span className="text-xs font-bold text-yellow-400">{quick.stories.pending}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-500 flex-1">منشورة</span>
                <span className="text-xs font-bold text-green-400">{quick.stories.published}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-3 h-3 text-red-400" />
                <span className="text-xs text-gray-500 flex-1">مرفوضة</span>
                <span className="text-xs font-bold text-red-400">{quick.stories.rejected}</span>
              </div>
            </div>
          </div>

          {/* السفراء */}
          <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-4 h-4 text-[#91B9B4]" />
              <span className="text-sm text-gray-400">طلبات السفراء</span>
            </div>
            <p className="text-3xl font-bold text-white mb-4">{fmt(quick.ambassadors.total)}</p>
            <div className="space-y-2">
              <Pill count={quick.ambassadors.pending} label="قيد المراجعة" color="#FBBF24" />
              <Pill count={quick.ambassadors.approved} label="مقبول" color="#34D399" />
            </div>
          </div>

          {/* رواد التراث */}
          <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">رواد التراث</span>
            </div>
            <p className="text-3xl font-bold text-white">{fmt(quick.pioneers)}</p>
            <p className="text-xs text-gray-500 mt-1">راوٍ مسجّل</p>
          </div>

          {/* المعرض */}
          <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-gray-400">معرض الصور</span>
            </div>
            <p className="text-3xl font-bold text-white">{fmt(quick.gallery)}</p>
            <p className="text-xs text-gray-500 mt-1">وسائط مرفوعة</p>
          </div>
        </div>
      )}

      {/* ── Live + Overview ── */}
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={Activity} label="الجلسات النشطة الآن" value={fmt(stats.real_time.active_sessions)}
              color="#34D399" trend="live" sub="مستخدم على المنصة"
            />
            <StatCard
              icon={Eye} label="مشاهدات آخر 5 دقائق" value={fmt(stats.real_time.recent_views)}
              color="#60A5FA" trend="up" sub="تحديث تلقائي كل دقيقة"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={Eye} label="إجمالي المشاهدات" value={fmt(stats.overview.total_views)}
              color="#FAC39B" trend="up" sparkData={trendData} />
            <StatCard icon={BookOpen} label="القراءات" value={fmt(stats.overview.total_reads)}
              color="#91B9B4" sub={`من ${fmt(stats.overview.total_views)} مشاهدة`} />
            <StatCard icon={Headphones} label="الاستماع" value={fmt(stats.overview.total_listens)}
              color="#A78BFA" sub="ملفات صوتية" />
            <StatCard icon={Play} label="المشاهدات المرئية" value={fmt(stats.overview.total_watches)}
              color="#F87171" sub="فيديوهات" />
            <StatCard icon={Users} label="الزوار الفريدون" value={fmt(stats.overview.unique_visitors)}
              color="#FBBF24" trend="up" sparkData={visitorData} />
            <StatCard icon={Clock} label="متوسط وقت التفاعل" value={fmtDuration(stats.overview.avg_duration)}
              color="#FB923C" sub="لكل زيارة" />
          </div>

          {/* ── Daily Trend Bars ── */}
          {stats.daily_trend?.length > 0 && (
            <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 className="w-4 h-4 text-[#FAC39B]" />
                <h2 className="text-sm font-semibold text-white">الاتجاه اليومي</h2>
                <span className="text-xs text-gray-500 mr-auto">آخر 7 أيام</span>
              </div>
              <div className="space-y-3">
                {stats.daily_trend.slice(-7).map((day, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 flex-shrink-0 text-left">
                      {new Date(day.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                    </span>
                    <MiniBar value={day.views} max={maxTrend} color="#FAC39B" />
                    <span className="text-xs font-medium text-[#FAC39B] w-12 text-left">{fmt(day.views)}</span>
                    <span className="text-xs text-gray-500 w-16 text-left">{fmt(day.visitors)} زائر</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Content Type Breakdown ── */}
          {Object.keys(stats.by_content_type).length > 0 && (
            <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="w-4 h-4 text-[#91B9B4]" />
                <h2 className="text-sm font-semibold text-white">الإحصائيات حسب نوع المحتوى</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.by_content_type).map(([type, data]) => (
                  <div key={type} className="bg-white/3 border border-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">{contentLabel[type] ?? type}</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'مشاهدات', value: data.views, color: '#FAC39B' },
                        { label: 'قراءات', value: data.reads, color: '#91B9B4' },
                        { label: 'استماع', value: data.listens, color: '#A78BFA' },
                        { label: 'زوار', value: data.unique_visitors, color: '#FBBF24' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-14">{label}</span>
                          <MiniBar value={value} max={Math.max(data.views, 1)} color={color} />
                          <span className="text-xs font-medium w-10 text-left" style={{ color }}>{fmt(value)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-3 pt-2 border-t border-white/5">
                      متوسط الوقت: <span className="text-gray-400">{fmtDuration(data.avg_duration)}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Top Content Table ── */}
          {stats.top_content?.length > 0 && (
            <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-semibold text-white">المحتوى الأكثر مشاهدة</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['#', 'النوع', 'المشاهدات', 'الزوار', 'معدل الإكمال'].map(h => (
                        <th key={h} className="text-right text-xs text-gray-500 font-medium px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.top_content.slice(0, 10).map((item, i) => (
                      <tr key={i} className="hover:bg-white/3 transition-colors">
                        <td className="px-3 py-2.5 text-gray-600 text-xs">{i + 1}</td>
                        <td className="px-3 py-2.5 text-white">{contentLabel[item.content_type] ?? item.content_type}</td>
                        <td className="px-3 py-2.5 text-[#FAC39B] font-medium">{fmt(item.views)}</td>
                        <td className="px-3 py-2.5 text-[#91B9B4]">{fmt(item.unique_visitors)}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: `${item.completion_rate}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{item.completion_rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Fallback if no analytics stats but quick stats loaded */}
      {!stats && quick && (
        <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-8 text-center">
          <BarChart2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">إحصائيات التفاعل التفصيلية ستظهر هنا بعد تفعيل نظام التحليلات</p>
        </div>
      )}
    </div>
  );
}
