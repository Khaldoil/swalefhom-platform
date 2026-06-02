import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../hooks/useToast';

interface AddEditStoryProps {
  isOpen: boolean;
  onClose: () => void;
  story: any;
  onSubmit?: (data: any) => void;
  categories?: any[];
}

export default function AddEditStory({ isOpen, onClose, story, onSubmit, categories: propCategories }: AddEditStoryProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    region: '',
    date: '',
    status: 'draft',
    metadata: {
      teller_name: '',
      teller_age: '',
      recording_location: ''
    }
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (isOpen) {
      if (propCategories) {
        setCategories(propCategories);
      } else {
        loadCategories();
      }

      if (story) {
        setFormData({
          title: story.title || '',
          content: story.content || '',
          category_id: story.category_id || '',
          region: story.region || '',
          date: story.date || '',
          status: story.status || 'draft',
          metadata: {
            teller_name: story.metadata?.teller_name || '',
            teller_age: story.metadata?.teller_age || '',
            recording_location: story.metadata?.recording_location || ''
          }
        });
      } else {
        setFormData({
          title: '',
          content: '',
          category_id: '',
          region: '',
          date: '',
          status: 'draft',
          metadata: {
            teller_name: '',
            teller_age: '',
            recording_location: ''
          }
        });
      }
    }
  }, [isOpen, story, propCategories]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('content_type', 'story')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      // Use parent's submit handler if provided
      onSubmit(formData);
    } else {
      // Fallback to direct save
      setIsLoading(true);
      try {
        if (story) {
          const { error } = await supabase
            .from('stories')
            .update(formData)
            .eq('id', story.id);

          if (error) throw error;
          addToast('تم تحديث القصة بنجاح', 'success');
        } else {
          const { error } = await supabase
            .from('stories')
            .insert([formData]);

          if (error) throw error;
          addToast('تم إضافة القصة بنجاح', 'success');
        }
        onClose();
      } catch (error: any) {
        console.error('Error saving story:', error);
        addToast('حدث خطأ أثناء حفظ القصة', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={story ? 'تعديل القصة' : 'إضافة قصة جديدة'}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <Input
          label="عنوان القصة"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            محتوى القصة
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FAC39B]"
            required
          />
        </div>

        <Select
          label="التصنيف"
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          required
        >
          <option value="">اختر التصنيف</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <Select
          label="المنطقة"
          value={formData.region}
          onChange={(e) => setFormData({
            ...formData,
            region: e.target.value
          })}
          required
        >
          <option value="">اختر المنطقة</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </Select>

        <Input
          label="التاريخ"
          type="text"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          placeholder="مثال: 1420هـ"
          required
        />

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-lg font-bold text-white mb-4">معلومات الراوي</h3>

          <div className="space-y-4">
            <Input
              label="اسم الراوي"
              value={formData.metadata.teller_name}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, teller_name: e.target.value }
              })}
            />

            <Input
              label="عمر الراوي"
              value={formData.metadata.teller_age}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, teller_age: e.target.value }
              })}
            />

            <Input
              label="مكان التسجيل"
              value={formData.metadata.recording_location}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, recording_location: e.target.value }
              })}
            />
          </div>
        </div>

        <Select
          label="الحالة"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
          <option value="rejected">مرفوض</option>
        </Select>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {story ? 'حفظ التعديلات' : 'إضافة القصة'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
