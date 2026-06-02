import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen">
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

      {/* Search and Filter Bar */}
      <Card className="mb-8">
        <div className="flex gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="ابحث في المسرد..."
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
            <div>
              <h3 className="text-white text-sm font-medium mb-2">التصنيف</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-[#FAC39B] text-[#0F2837]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  الكل
                </button>
                {[
                  { id: 'daily', name: 'الحياة اليومية' },
                  { id: 'trade', name: 'التجارة والأسواق' },
                  { id: 'agriculture', name: 'الزراعة' },
                  { id: 'weather', name: 'الطقس والمناخ' },
                  { id: 'food', name: 'الطعام والشراب' },
                  { id: 'clothes', name: 'الملابس والأزياء' }
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#FAC39B] text-[#0F2837]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Terms Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المصطلح</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">التعريف</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">التصنيف</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المثال</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المصدر</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTerms.length > 0 ? (
                filteredTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{term.word}</td>
                    <td className="px-6 py-4 text-white">{term.definition}</td>
                    <td className="px-6 py-4 text-white">
                      {term.category === 'daily' && 'الحياة اليومية'}
                      {term.category === 'trade' && 'التجارة والأسواق'}
                      {term.category === 'agriculture' && 'الزراعة'}
                      {term.category === 'weather' && 'الطقس والمناخ'}
                      {term.category === 'food' && 'الطعام والشراب'}
                      {term.category === 'clothes' && 'الملابس والأزياء'}
                    </td>
                    <td className="px-6 py-4 text-white">{term.example}</td>
                    <td className="px-6 py-4 text-white">{term.source || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditTerm(term)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTerm(term)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-500"
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
                    لا توجد مصطلحات مضافة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
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