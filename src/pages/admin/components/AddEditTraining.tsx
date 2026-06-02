import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../hooks/useToast';

interface AddEditTrainingProps {
  isOpen: boolean;
  onClose: () => void;
  training: any;
  onSave: () => void;
}

export default function AddEditTraining({ isOpen, onClose, training, onSave }: AddEditTrainingProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
    content: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && training) {
      setFormData(training);
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        duration: '',
        level: 'beginner',
        content: []
      });
    }
  }, [isOpen, training]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (training) {
        const { error } = await supabase
          .from('training_programs')
          .update(formData)
          .eq('id', training.id);

        if (error) throw error;
        addToast('تم تحديث البرنامج التدريبي بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('training_programs')
          .insert([formData]);

        if (error) throw error;
        addToast('تم إضافة البرنامج التدريبي بنجاح', 'success');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving training:', error);
      addToast('حدث خطأ أثناء حفظ البرنامج التدريبي', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={training ? 'تعديل البرنامج التدريبي' : 'إضافة برنامج تدريبي جديد'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="عنوان البرنامج"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            الوصف
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FAC39B]"
            required
          />
        </div>

        <Input
          label="المدة"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="مثال: 3 أيام"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            المستوى
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FAC39B]"
            required
          >
            <option value="beginner">مبتدئ</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">متقدم</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {training ? 'حفظ التعديلات' : 'إضافة البرنامج'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
