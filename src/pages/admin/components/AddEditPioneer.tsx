import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ImageUpload from '../../../components/ImageUpload';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../hooks/useToast';

interface AddEditPioneerProps {
  isOpen: boolean;
  onClose: () => void;
  pioneer: any;
  onSave: () => void;
}

export default function AddEditPioneer({ isOpen, onClose, pioneer, onSave }: AddEditPioneerProps) {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    bio: '',
    region: '',
    birth_year: '',
    death_year: '',
    image_url: '',
    achievements: [],
    books: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && pioneer) {
      setFormData(pioneer);
    } else if (isOpen) {
      setFormData({
        name: '',
        specialty: '',
        bio: '',
        region: '',
        birth_year: '',
        death_year: '',
        image_url: '',
        achievements: [],
        books: []
      });
    }
  }, [isOpen, pioneer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (pioneer) {
        const { error } = await supabase
          .from('pioneers')
          .update(formData)
          .eq('id', pioneer.id);

        if (error) throw error;
        addToast('تم تحديث الرائد بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('pioneers')
          .insert([formData]);

        if (error) throw error;
        addToast('تم إضافة الرائد بنجاح', 'success');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving pioneer:', error);
      addToast('حدث خطأ أثناء حفظ الرائد', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pioneer ? 'تعديل الرائد' : 'إضافة رائد جديد'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="الاسم"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="التخصص"
          value={formData.specialty}
          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            السيرة الذاتية
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FAC39B]"
            required
          />
        </div>

        <ImageUpload
          currentImage={formData.image_url}
          onUpload={(url) => setFormData({ ...formData, image_url: url })}
          bucket="pioneers"
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {pioneer ? 'حفظ التعديلات' : 'إضافة الرائد'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
