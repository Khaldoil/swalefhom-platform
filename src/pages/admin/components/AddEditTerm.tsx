import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../hooks/useToast';

interface AddEditTermProps {
  isOpen: boolean;
  onClose: () => void;
  term: any;
  onSave: () => void;
}

export default function AddEditTerm({ isOpen, onClose, term, onSave }: AddEditTermProps) {
  const [formData, setFormData] = useState({
    term: '',
    definition: '',
    category: '',
    example: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && term) {
      setFormData(term);
    } else if (isOpen) {
      setFormData({
        term: '',
        definition: '',
        category: '',
        example: ''
      });
    }
  }, [isOpen, term]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (term) {
        const { error } = await supabase
          .from('glossary_terms')
          .update(formData)
          .eq('id', term.id);

        if (error) throw error;
        addToast('تم تحديث المصطلح بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('glossary_terms')
          .insert([formData]);

        if (error) throw error;
        addToast('تم إضافة المصطلح بنجاح', 'success');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving term:', error);
      addToast('حدث خطأ أثناء حفظ المصطلح', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={term ? 'تعديل المصطلح' : 'إضافة مصطلح جديد'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="المصطلح"
          value={formData.term}
          onChange={(e) => setFormData({ ...formData, term: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            التعريف
          </label>
          <textarea
            value={formData.definition}
            onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FAC39B]"
            required
          />
        </div>

        <Input
          label="التصنيف"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />

        <Input
          label="مثال (اختياري)"
          value={formData.example}
          onChange={(e) => setFormData({ ...formData, example: e.target.value })}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {term ? 'حفظ التعديلات' : 'إضافة المصطلح'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
