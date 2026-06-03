import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Users,
  TrendingUp,
  Eye,
  Headphones,
  Play,
  Download,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import { exportToCSV } from '../../lib/export-utils';

interface DashboardStats {
  overview: {
    total_views: number;
    total_reads: number;
    total_listens: number;
    total_watches: number;
    unique_visitors: number;
    avg_duration: number;
  };
  by_content_type: {
    [key: string]: {
      views: number;
      reads: number;
      listens: number;
      watches: number;
      unique_visitors: number;
      avg_duration: number;
    };
  };
  daily_trend: Array<{
    date: string;
    views: number;
    visitors: number;
    avg_duration: number;
  }>;
  top_content: Array<{
    content_type: string;
    content_id: string;
    views: number;
    unique_visitors: number;
    completion_rate: number;
  }>;
  real_time: {
    active_sessions: number;
    recent_views: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const { addToast } = useToast();

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000); // تحديث كل دقيقة
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        days_back: timeRange
      });

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      addToast('حدث خطأ أثناء تحميل الإحصائيات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportStats = () => {
    if (!stats) return;

    const exportData = [
      {
        'نوع الإحصائية': 'إجمالي المشاهدات',
        'العدد': stats.overview.total_views
      },
      {
        'نوع الإحصائية': 'القراءات',
        'العدد': stats.overview.total_reads
      },
      {
        'نوع الإحصائية': 'الاستماع',
        'العدد': stats.overview.total_listens
      },
      {
        'نوع الإحصائية': 'المشاهدات',
        'العدد': stats.overview.total_watches
      },
      {
        'نوع الإحصائية': 'الزوار الفريدون',
        'العدد': stats.overview.unique_visitors
      }
    ];

    exportToCSV(exportData, 'dashboard_stats');
    addToast('تم تصدير الإحصائيات بنجاح', 'success');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}د ${secs}ث` : `${secs}ث`;
  };

  const getContentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      story: 'القصص',
      pioneer: 'رواد التراث',
      gallery: 'المعرض',
      blog: 'المدونة',
      training: 'التدريب',
      event: 'الفعاليات'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-400 py-12">
        لا توجد إحصائيات متاحة
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم - الإحصائيات</h1>
          <p className="text-gray-400">تتبع دقيق لجميع التفاعلات والمشاهدات</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FAC39B]"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوم</option>
            <option value={90}>آخر 90 يوم</option>
            <option value={365}>آخر سنة</option>
          </select>
          <Button onClick={exportStats} variant="secondary">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-start justify-between">
            <div>
              <Activity className="w-6 h-6 text-green-400 mb-4 animate-pulse" />
              <h3 className="text-sm font-medium text-gray-400">الجلسات النشطة الآن</h3>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.real_time.active_sessions}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              مباشر
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <Eye className="w-6 h-6 text-blue-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-400">المشاهدات الأخيرة (5 دقائق)</h3>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.real_time.recent_views}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-[#FAC39B]/20 transition-colors">
          <Eye className="w-8 h-8 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">إجمالي المشاهدات</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {stats.overview.total_views.toLocaleString('ar-SA')}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <ArrowUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">نشط</span>
          </div>
        </Card>

        <Card className="hover:border-[#FAC39B]/20 transition-colors">
          <BookOpen className="w-8 h-8 text-[#91B9B4] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">القراءات</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {stats.overview.total_reads.toLocaleString('ar-SA')}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            من {stats.overview.total_views.toLocaleString('ar-SA')} مشاهدة
          </p>
        </Card>

        <Card className="hover:border-[#FAC39B]/20 transition-colors">
          <Headphones className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الاستماع</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {stats.overview.total_listens.toLocaleString('ar-SA')}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            ملفات صوتية
          </p>
        </Card>

        <Card className="hover:border-[#FAC39B]/20 transition-colors">
          <Play className="w-8 h-8 text-red-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">المشاهدات المرئية</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {stats.overview.total_watches.toLocaleString('ar-SA')}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            فيديوهات ووسائط
          </p>
        </Card>

        <Card className="hover:border-[#FAC39B]/20 transition-colors">
          <Users className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الزوار الفريدون</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {stats.overview.unique_visitors.toLocaleString('ar-SA')}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            زائر مميز
          </p>
        </Card>

        <Card className="hover:border-[#FAC39B]/20 transition-colors">
          <Clock className="w-8 h-8 text-orange-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">متوسط وقت التفاعل</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {formatDuration(stats.overview.avg_duration)}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            لكل زيارة
          </p>
        </Card>
      </div>

      {/* Stats by Content Type */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-6">الإحصائيات حسب نوع المحتوى</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(stats.by_content_type).map(([type, data]) => (
            <div key={type} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">
                {getContentTypeLabel(type)}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">المشاهدات:</span>
                  <span className="text-white font-medium">
                    {data.views.toLocaleString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">القراءات:</span>
                  <span className="text-[#91B9B4] font-medium">
                    {data.reads.toLocaleString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">الاستماع:</span>
                  <span className="text-purple-400 font-medium">
                    {data.listens.toLocaleString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">المشاهدات المرئية:</span>
                  <span className="text-red-400 font-medium">
                    {data.watches.toLocaleString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-sm text-gray-400">الزوار:</span>
                  <span className="text-[#FAC39B] font-medium">
                    {data.unique_visitors.toLocaleString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">متوسط الوقت:</span>
                  <span className="text-white font-medium">
                    {formatDuration(data.avg_duration)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Content */}
      {stats.top_content && stats.top_content.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-white mb-6">المحتوى الأكثر مشاهدة</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right text-sm font-medium text-gray-400 px-4 py-3">النوع</th>
                  <th className="text-right text-sm font-medium text-gray-400 px-4 py-3">المشاهدات</th>
                  <th className="text-right text-sm font-medium text-gray-400 px-4 py-3">الزوار</th>
                  <th className="text-right text-sm font-medium text-gray-400 px-4 py-3">معدل الإكمال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats.top_content.slice(0, 10).map((item, index) => (
                  <tr key={index} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-white">
                      {getContentTypeLabel(item.content_type)}
                    </td>
                    <td className="px-4 py-3 text-[#FAC39B] font-medium">
                      {item.views.toLocaleString('ar-SA')}
                    </td>
                    <td className="px-4 py-3 text-[#91B9B4] font-medium">
                      {item.unique_visitors.toLocaleString('ar-SA')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-400 h-full rounded-full"
                            style={{ width: `${item.completion_rate}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium min-w-[3rem] text-left">
                          {item.completion_rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Daily Trend */}
      {stats.daily_trend && stats.daily_trend.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-white mb-6">الاتجاه اليومي</h2>
          <div className="space-y-4">
            {stats.daily_trend.slice(0, 7).map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-400">
                  {new Date(day.date).toLocaleDateString('ar-SA', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-[#FAC39B] to-[#91B9B4] h-full rounded-full flex items-center justify-end pr-3"
                        style={{
                          width: `${Math.min((day.views / Math.max(...stats.daily_trend.map(d => d.views))) * 100, 100)}%`
                        }}
                      >
                        <span className="text-white text-sm font-medium">
                          {day.views.toLocaleString('ar-SA')}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 min-w-[5rem]">
                      {day.visitors.toLocaleString('ar-SA')} زائر
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
