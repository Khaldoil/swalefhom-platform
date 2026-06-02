import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../hooks/useToast';

interface AddEditEventProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSave: () => void;
}

export default function AddEditEvent({ isOpen, onClose, event, onSave }: AddEditEventProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    type: 'workshop'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && event) {
      setFormData(event);
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        type: 'workshop'
      });
    }
  }, [isOpen, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (event) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', event.id);

        if (error) throw error;
        addToast('تم تحديث الفعالية بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([formData]);

        if (error) throw error;
        addToast('تم إضافة الفعالية بنجاح', 'success');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving event:', error);
      addToast('حدث خطأ أثناء حفظ الفعالية', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="عنوان الفعالية"
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
          label="التاريخ"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Input
          label="المكان"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {event ? 'حفظ التعديلات' : 'إضافة الفعالية'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
