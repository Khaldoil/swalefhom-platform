import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, BookMarked, RefreshCw, Tag, X } from 'lucide-react';
import { getGlossaryTerms, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } from '../../lib/supabase';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import AddEditTerm from './components/AddEditTerm';
import DeleteConfirmation from './components/DeleteConfirmation';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export default function Glossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

   
  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const data = await getGlossaryTerms();
      setTerms(data);
    } catch (error) {
      console.error('Error loading terms:', error);
      addToast('حدث خطأ أثناء تحميل المصطلحات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTerm = () => {
    setSelectedTerm(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditTerm = (term: any) => {
    setSelectedTerm({
      id: term.id,
      word: term.word,
      definition: term.definition,
      category: term.category,
      example: term.example,
      source: term.source
    });
    setIsAddEditModalOpen(true);
  };

  const handleDeleteTerm = (term: any) => {
    setSelectedTerm(term);
    setIsDeleteModalOpen(true);
  };

  const handleTermSubmit = async (data: any) => {
    try {
      if (selectedTerm) {
        await updateGlossaryTerm(selectedTerm.id, data);
        addToast('تم تحديث المصطلح بنجاح', 'success');
      } else {
        await createGlossaryTerm(data);
        addToast('تم إضافة المصطلح بنجاح', 'success');
      }
      loadTerms();
      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error('Error saving term:', error);
      addToast('حدث خطأ أثناء حفظ المصطلح', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteGlossaryTerm(selectedTerm.id);
      addToast('تم حذف المصطلح بنجاح', 'success');
      loadTerms();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting term:', error);
      addToast('حدث خطأ أثناء حذف المصطلح', 'error');
    }
  };

  const filteredTerms = terms.filter(term => {
    const matchesCategory = !selectedCategory || term.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      term.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة مسرد الألفاظ</h1>
          <p className="text-gray-400">إدارة المصطلحات والألفاظ التراثية</p>
        </div>
        <Button onClick={handleAddTerm}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة مصطلح جديد
        </Button>
      </div>

      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في المصطلحات..."
              className="w-full bg-white/5 border border-white/8 text-white rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition-all ${showFilters ? 'bg-[#FAC39B]/10 border-[#FAC39B]/30 text-[#FAC39B]' : 'bg-white/5 border-white/8 text-gray-400 hover:text-white'}`}>
            <Filter className="w-4 h-4" />تصفية
          </button>
        </div>
        {showFilters && (
          <div className="pt-3 border-t border-white/8">
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setSelectedCategory(null)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all ${!selectedCategory ? 'bg-[#FAC39B]/15 text-[#FAC39B]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>الكل</button>
              {[
                { id: 'daily', name: 'الحياة اليومية' }, { id: 'trade', name: 'التجارة والأسواق' },
                { id: 'agriculture', name: 'الزراعة' }, { id: 'weather', name: 'الطقس' },
                { id: 'food', name: 'الطعام' }, { id: 'clothes', name: 'الملابس' }
              ].map(c => (
                <button key={c.id} onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-all ${selectedCategory === c.id ? 'bg-[#FAC39B]/15 text-[#FAC39B]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">المصطلح</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">التعريف</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">التصنيف</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">المثال</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">المصدر</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTerms.length > 0 ? (
                filteredTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{term.word}</td>
                    <td className="px-4 py-3 text-sm text-white">{term.definition}</td>
                    <td className="px-4 py-3 text-sm text-white">
                      {term.category === 'daily' && 'الحياة اليومية'}
                      {term.category === 'trade' && 'التجارة والأسواق'}
                      {term.category === 'agriculture' && 'الزراعة'}
                      {term.category === 'weather' && 'الطقس والمناخ'}
                      {term.category === 'food' && 'الطعام والشراب'}
                      {term.category === 'clothes' && 'الملابس والأزياء'}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{term.example}</td>
                    <td className="px-4 py-3 text-sm text-white">{term.source || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                          <button onClick={() => handleEditTerm(term)} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteTerm(term)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-gray-500 text-sm">لا توجد مصطلحات بعد</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditTerm
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleTermSubmit}
        term={selectedTerm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="المصطلح"
      />
    </div>
  );
}