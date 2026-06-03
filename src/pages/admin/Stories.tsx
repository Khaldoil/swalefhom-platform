import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, CreditCard as Edit, Trash2, Eye, CheckCircle, XCircle, AlertTriangle, Download, Check, Send, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useLocation } from 'react-router-dom';
import { exportToCSV, prepareStoriesForExport } from '../../lib/export-utils';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function Stories() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    location.state?.selectedCategory || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, _setError] = useState<string | null>(null);
  const [_showDetailsModal, _setShowDetailsModal] = useState(false);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'published' | 'rejected'>('published');
  const [adminNote, setAdminNote] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const regions = [
    { id: 'riyadh', name: 'الرياض' },
    { id: 'makkah', name: 'مكة المكرمة' },
    { id: 'madinah', name: 'المدينة المنورة' },
    { id: 'eastern', name: 'المنطقة الشرقية' },
    { id: 'qassim', name: 'القصيم' },
    { id: 'asir', name: 'عسير' },
    { id: 'tabuk', name: 'تبوك' },
    { id: 'hail', name: 'حائل' },
    { id: 'northern', name: 'الحدود الشمالية' },
    { id: 'jazan', name: 'جازان' },
    { id: 'najran', name: 'نجران' },
    { id: 'baha', name: 'الباحة' },
    { id: 'jawf', name: 'الجوف' }
  ];

   
  useEffect(() => {
    loadStories();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('content_type', 'story')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      addToast('حدث خطأ أثناء تحميل التصنيفات', 'error');
    }
  };

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (err) {
      console.error('Error loading stories:', err);
      addToast('حدث خطأ أثناء تحميل القصص', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStory = () => {
    setSelectedStory(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditStory = (story: any) => {
    setSelectedStory(story);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteStory = (story: any) => {
    setSelectedStory(story);
    setIsDeleteModalOpen(true);
  };

  const handleStorySubmit = async (data: any) => {
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
    } catch (error) {
      console.error('Error saving story:', error);
      addToast('حدث خطأ أثناء حفظ القصة', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStory(selectedStory.id);
      addToast('تم حذف القصة بنجاح', 'success');
      loadStories();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting story:', error);
      addToast('حدث خطأ أثناء حذف القصة', 'error');
    }
  };

  const openDecisionModal = (story: any, type: 'published' | 'rejected') => {
    setSelectedStory(story);
    setDecisionType(type);
    setAdminNote('');
    setShowDecisionModal(true);
  };

  const handleStatusChange = async (story: any, newStatus: string, note?: string) => {
    setIsSendingNotification(true);
    try {
      await updateStory(story.id, { ...story, status: newStatus });

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      try {
        const notificationResponse = await fetch(`${supabaseUrl}/functions/v1/notify-story-decision`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            story,
            status: newStatus,
            adminNote: note || ''
          }),
        });

        if (!notificationResponse.ok) {
          console.error('Failed to send notification');
          addToast('تم تحديث الحالة ولكن فشل إرسال الإشعار', 'warning');
        } else {
          addToast(`تم ${newStatus === 'published' ? 'نشر' : 'رفض'} القصة وإرسال الإشعار بنجاح`, 'success');
        }
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
        addToast('تم تحديث الحالة ولكن فشل إرسال الإشعار', 'warning');
      }

      loadStories();
    } catch (error) {
      console.error('Error updating story status:', error);
      addToast('حدث خطأ أثناء تحديث حالة القصة', 'error');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleDecisionSubmit = async () => {
    if (selectedStory) {
      await handleStatusChange(selectedStory, decisionType, adminNote);
      setShowDecisionModal(false);
      setShowDetailsModal(false);
    }
  };

  const handleViewDetails = (story: any) => {
    setSelectedStory(story);
    setShowDetailsModal(true);
  };

  const handleSelectStory = (storyId: string) => {
    setSelectedStories(prev =>
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStories.length === filteredStories.length) {
      setSelectedStories([]);
    } else {
      setSelectedStories(filteredStories.map(s => s.id));
    }
  };

  const handleBulkPublish = async () => {
    if (selectedStories.length === 0) return;

    try {
      const { error } = await supabase
        .from('stories')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .in('id', selectedStories);

      if (error) throw error;

      addToast(`تم نشر ${selectedStories.length} قصة بنجاح`, 'success');
      setSelectedStories([]);
      loadStories();
    } catch (error) {
      console.error('Bulk publish error:', error);
      addToast('حدث خطأ أثناء النشر الجماعي', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStories.length === 0) return;

    if (!confirm(`هل أنت متأكد من حذف ${selectedStories.length} قصة؟`)) return;

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .in('id', selectedStories);

      if (error) throw error;

      addToast(`تم حذف ${selectedStories.length} قصة بنجاح`, 'success');
      setSelectedStories([]);
      loadStories();
    } catch (error) {
      console.error('Bulk delete error:', error);
      addToast('حدث خطأ أثناء الحذف الجماعي', 'error');
    }
  };

  const handleExportSelected = () => {
    if (selectedStories.length === 0) {
      addToast('يرجى اختيار قصص للتصدير', 'warning');
      return;
    }

    const storiesToExport = stories.filter(s => selectedStories.includes(s.id));
    exportToCSV(prepareStoriesForExport(storiesToExport), 'selected_stories');
    addToast('تم تصدير القصص المحددة بنجاح', 'success');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm">منشور</span>;
      case 'draft':
        return <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm">بانتظار المراجعة</span>;
      case 'rejected':
        return <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm">مرفوض</span>;
      default:
        return null;
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesRegion = !selectedRegion || story.region === selectedRegion;
    const matchesStatus = !selectedStatus || story.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.metadata?.teller_name && story.metadata.teller_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || story.category_id === selectedCategory;
    return matchesRegion && matchesStatus && matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadStories}
              className="text-[#FAC39B] hover:text-white transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingStories = stories.filter(story => story.status === 'draft').length;
  const publishedStories = stories.filter(story => story.status === 'published').length;
  const rejectedStories = stories.filter(story => story.status === 'rejected').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة القصص</h1>
          <p className="text-gray-400">إضافة وتعديل وحذف القصص التراثية</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleAddStory}>
            <Plus className="w-5 h-5 ml-2" />
            إضافة قصة جديدة
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStories.length > 0 && (
        <Card className="mb-6 bg-[#91B9B4]/10 border-[#91B9B4]/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#91B9B4]" />
              <span className="text-white font-medium">
                تم تحديد {selectedStories.length} قصة
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkPublish}
                variant="secondary"
                className="flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                نشر
              </Button>
              <Button
                onClick={handleExportSelected}
                variant="secondary"
                className="flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                تصدير
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="secondary"
                className="flex items-center gap-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <AlertTriangle className="w-6 h-6 text-yellow-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">بانتظار المراجعة</h3>
          <p className="text-2xl font-bold text-white mt-2">{pendingStories}</p>
        </Card>
        <Card>
          <CheckCircle className="w-6 h-6 text-green-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">القصص المنشورة</h3>
          <p className="text-2xl font-bold text-white mt-2">{publishedStories}</p>
        </Card>
        <Card>
          <XCircle className="w-6 h-6 text-red-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-400">القصص المرفوضة</h3>
          <p className="text-2xl font-bold text-white mt-2">{rejectedStories}</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <div className="flex gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="ابحث في القصص..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-white text-sm font-medium mb-2">المنطقة</h3>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedRegion === region.id
                          ? 'bg-[#FAC39B] text-[#0F2837]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white text-sm font-medium mb-2">الحالة</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'draft', name: 'بانتظار المراجعة', color: 'yellow' },
                    { id: 'published', name: 'منشور', color: 'green' },
                    { id: 'rejected', name: 'مرفوض', color: 'red' }
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatus(selectedStatus === status.id ? null : status.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedStatus === status.id
                          ? `bg-${status.color}-500/10 text-${status.color}-400`
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {status.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Stories Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedStories.length === filteredStories.length && filteredStories.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#91B9B4] focus:ring-[#91B9B4]"
                  />
                </th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">العنوان</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الراوي</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المنطقة</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">التاريخ</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الحالة</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <tr key={story.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStories.includes(story.id)}
                        onChange={() => handleSelectStory(story.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#91B9B4] focus:ring-[#91B9B4]"
                      />
                    </td>
                    <td className="px-6 py-4 text-white">{story.title}</td>
                    <td className="px-6 py-4 text-white">
                      {story.metadata?.teller_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {regions.find(r => r.id === story.region)?.name}
                    </td>
                    <td className="px-6 py-4 text-white">{story.date}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(story.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {story.status === 'draft' && (
                          <>
                            <button
                              onClick={() => openDecisionModal(story, 'published')}
                              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors text-gray-400 hover:text-green-400"
                              title="نشر القصة"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openDecisionModal(story, 'rejected')}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                              title="رفض القصة"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleViewDetails(story)}
                          className="p-2 hover:bg-[#FAC39B]/10 rounded-lg transition-colors text-gray-400 hover:text-[#FAC39B]"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/stories/${story.id}/annotations`)}
                          className="p-2 hover:bg-[#91B9B4]/10 rounded-lg transition-colors text-gray-400 hover:text-[#91B9B4]"
                          title="إدارة التفسيرات"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditStory(story)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          title="تعديل القصة"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStory(story)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                          title="حذف القصة"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan={6} className="px-6 py-8 text-gray-400">
                    لا توجد قصص مضافة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <AddEditStory
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleStorySubmit}
        story={selectedStory}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="القصة"
      />

      {/* Decision Modal */}
      {showDecisionModal && selectedStory && (
        <Modal
          isOpen={true}
          onClose={() => setShowDecisionModal(false)}
          title={decisionType === 'published' ? 'نشر القصة' : 'رفض القصة'}
        >
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${
              decisionType === 'published'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <p className="text-white mb-2">
                أنت على وشك {decisionType === 'published' ? 'نشر' : 'رفض'} قصة <strong>"{selectedStory.title}"</strong>
              </p>
              <p className="text-gray-400 text-sm">
                سيتم إرسال إشعار بريد إلكتروني تلقائياً للراوي <strong>{selectedStory.metadata?.teller_email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                رسالة للراوي (اختياري)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={decisionType === 'published'
                  ? 'شكراً لمساهمتك في حفظ التراث...'
                  : 'سبب الرفض أو ملاحظات للتحسين...'
                }
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FAC39B] resize-none"
              />
              <p className="text-gray-500 text-xs mt-2">
                {decisionType === 'published'
                  ? 'مثال: قصتك رائعة وتعكس عمق تراثنا. شكراً لك!'
                  : 'مثال: القصة تحتاج إلى مزيد من التفاصيل عن مصدرها'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDecisionSubmit}
                disabled={isSendingNotification}
                className="flex-1"
                variant={decisionType === 'published' ? 'primary' : 'danger'}
              >
                {isSendingNotification ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="mr-2">جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 ml-2" />
                    {decisionType === 'published' ? 'نشر وإرسال الإشعار' : 'رفض وإرسال الإشعار'}
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