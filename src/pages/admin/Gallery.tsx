import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Film, X, Eye, EyeOff, Upload, CreditCard as Edit } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import DeleteConfirmation from './components/DeleteConfirmation';
import MultiMediaUpload from '../../components/MultiMediaUpload';
import { useToast } from '../../hooks/useToast';
import { createGalleryItem, getGalleryItems, updateGalleryItem, deleteGalleryItem } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: (data: any) => void;
}

function EditModal({ isOpen, onClose, item, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    copyright: item.copyright || (
      item.media_type === 'image' 
        ? 'Digital asset copyright: Pitt Rivers Museum, University of Oxford'
        : '© سواليفهم - جميع الحقوق محفوظة'
    )
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...item, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F2837] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 w-full max-w-[95vw] sm:max-w-sm md:max-w-md border border-white/10 my-4 sm:my-auto">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-4 sm:mb-6 pr-2">تعديل معلومات الوسائط</h3>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Input
            label="العنوان"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="أدخل عنواناً للوسائط"
          />
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/10 text-white rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
              placeholder="أدخل وصفاً للوسائط"
            />
          </div>

          <Input
            label="حقوق النشر"
            value={formData.copyright}
            onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
            placeholder="أدخل معلومات حقوق النشر"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="w-full sm:flex-1">
              حفظ التغييرات
            </Button>
            <Button type="button" variant="secondary" className="w-full sm:flex-1" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'images' | 'videos'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const data = await getGalleryItems();
      setMedia(data || []);
    } catch (err) {
      console.error('Error loading media:', err);
      addToast('حدث خطأ أثناء تحميل الوسائط', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpload = async (files: { url: string; type: 'image' | 'video' }[]) => {
    try {
      const uploadPromises = files.map(file => 
        createGalleryItem({
          title: `${file.type === 'image' ? 'صورة' : 'فيديو'} جديد`,
          description: '',
          copyright: file.type === 'image' 
            ? 'Digital asset copyright: Pitt Rivers Museum, University of Oxford'
            : '© سواليفهم - جميع الحقوق محفوظة',
          media_url: file.url,
          media_type: file.type,
          status: 'draft'
        })
      );

      await Promise.all(uploadPromises);
      addToast('تم رفع الوسائط بنجاح', 'success');
      setIsUploadModalOpen(false);
      await loadMedia();
    } catch (error) {
      console.error('Error creating media items:', error);
      addToast('حدث خطأ أثناء رفع الوسائط', 'error');
    }
  };

  const handleStatusChange = async (mediaItem: any, newStatus: string) => {
    try {
      await updateGalleryItem(mediaItem.id, { ...mediaItem, status: newStatus });
      addToast(`تم ${newStatus === 'published' ? 'نشر' : 'إخفاء'} الوسائط بنجاح`, 'success');
      await loadMedia();
    } catch (error) {
      console.error('Error updating media status:', error);
      addToast('حدث خطأ أثناء تحديث حالة الوسائط', 'error');
    }
  };

  const handleEditSave = async (data: any) => {
    try {
      await updateGalleryItem(data.id, data);
      addToast('تم تحديث معلومات الوسائط بنجاح', 'success');
      setIsEditModalOpen(false);
      await loadMedia();
    } catch (error) {
      console.error('Error updating media:', error);
      addToast('حدث خطأ أثناء تحديث معلومات الوسائط', 'error');
    }
  };

  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;

    try {
      await deleteGalleryItem(selectedMedia.id);
      addToast('تم حذف الوسائط بنجاح', 'success');
      await loadMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      addToast('حدث خطأ أثناء حذف الوسائط', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedMedia(null);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || 
      (selectedType === 'images' && item.media_type === 'image') ||
      (selectedType === 'videos' && item.media_type === 'video');
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-white mb-2">إدارة معرض الوسائط</h1>
          <p className="text-gray-400">إدارة الصور والفيديوهات في المعرض</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="w-5 h-5 ml-2" />
          رفع وسائط جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <Eye className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الوسائط المنشورة</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {media.filter(item => item.status === 'published').length}
          </p>
        </Card>
        <Card>
          <EyeOff className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الوسائط المخفية</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {media.filter(item => item.status === 'draft').length}
          </p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <div className="flex gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="ابحث في الوسائط..."
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
                <h3 className="text-white text-sm font-medium mb-2">نوع الوسائط</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedType === 'all'
                        ? 'bg-[#FAC39B] text-[#0F2837]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setSelectedType('images')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedType === 'images'
                        ? 'bg-[#FAC39B] text-[#0F2837]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    الصور
                  </button>
                  <button
                    onClick={() => setSelectedType('videos')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedType === 'videos'
                        ? 'bg-[#FAC39B] text-[#0F2837]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    الفيديوهات
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-white text-sm font-medium mb-2">الحالة</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedStatus === 'all'
                        ? 'bg-[#FAC39B] text-[#0F2837]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setSelectedStatus('published')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedStatus === 'published'
                        ? 'bg-[#FAC39B] text-[#0F2837]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    منشور
                  </button>
                  <button
                    onClick={() => setSelectedStatus('draft')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedStatus === 'draft'
                        ? 'bg-[#FAC39B] text-[#0F2837]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    مخفي
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.map((item) => (
          <Card key={item.id} className="group">
            <div className="aspect-video rounded-lg overflow-hidden mb-4">
              {item.media_type === 'image' ? (
                <img
                  src={item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={item.media_url}
                  className="w-full h-full object-cover"
                  controls
                />
              )}
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">{item.title}</h3>
              {item.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.status === 'published'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {item.status === 'published' ? 'منشور' : 'مخفي'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMedia(item);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    title="تعديل"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(item, item.status === 'published' ? 'draft' : 'published')}
                    className={`p-2 rounded-lg transition-colors ${
                      item.status === 'published'
                        ? 'hover:bg-yellow-500/10 text-yellow-400'
                        : 'hover:bg-green-500/10 text-green-400'
                    }`}
                    title={item.status === 'published' ? 'إخفاء' : 'نشر'}
                  >
                    {item.status === 'published' ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMedia(item);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0F2837] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 w-full max-w-[95vw] sm:max-w-sm md:max-w-md border border-white/10 my-4 sm:my-auto">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-4 sm:mb-6 pr-2">رفع وسائط جديدة</h3>
            <MultiMediaUpload onUpload={handleMediaUpload} type="both" />
            <Button
              variant="secondary"
              className="w-full mt-3 sm:mt-4"
              onClick={() => setIsUploadModalOpen(false)}
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedMedia && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          item={selectedMedia}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteMedia}
        itemType={selectedMedia?.media_type === 'video' ? 'الفيديو' : 'الصورة'}
      />
    </div>
  );
}