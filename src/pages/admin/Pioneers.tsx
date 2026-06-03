import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, Award } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import AddEditPioneer from './components/AddEditPioneer';
import DeleteConfirmation from './components/DeleteConfirmation';

export default function Pioneers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPioneer, setSelectedPioneer] = useState<any>(null);
  const [pioneers, setPioneers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

   
  useEffect(() => {
    loadPioneers();
  }, []);

  const loadPioneers = async () => {
    try {
      const { data, error } = await supabase
        .from('pioneers')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPioneers(data || []);
    } catch (error) {
      console.error('Error loading pioneers:', error);
      addToast('حدث خطأ أثناء تحميل رواد التراث', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPioneer = () => {
    setSelectedPioneer(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditPioneer = (pioneer: any) => {
    setSelectedPioneer(pioneer);
    setIsAddEditModalOpen(true);
  };

  const handleDeletePioneer = (pioneer: any) => {
    setSelectedPioneer(pioneer);
    setIsDeleteModalOpen(true);
  };

  const handlePioneerSubmit = async (data: any) => {
    try {
      if (selectedPioneer) {
        const { error } = await supabase
          .from('pioneers')
          .update(data)
          .eq('id', selectedPioneer.id);

        if (error) throw error;
        addToast('تم تحديث معلومات الرائد بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('pioneers')
          .insert([data]);

        if (error) throw error;
        addToast('تم إضافة الرائد بنجاح', 'success');
      }
      loadPioneers();
      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error('Error saving pioneer:', error);
      addToast('حدث خطأ أثناء حفظ معلومات الرائد', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from('pioneers')
        .delete()
        .eq('id', selectedPioneer.id);

      if (error) throw error;
      addToast('تم حذف الرائد بنجاح', 'success');
      loadPioneers();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting pioneer:', error);
      addToast('حدث خطأ أثناء حذف الرائد', 'error');
    }
  };

  const filteredPioneers = pioneers.filter(pioneer =>
    pioneer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pioneer.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-white mb-2">إدارة رواد التراث</h1>
          <p className="text-gray-400">إدارة وتحرير معلومات رواد التراث</p>
        </div>
        <Button onClick={handleAddPioneer}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة رائد جديد
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <Input
          type="text"
          placeholder="ابحث في رواد التراث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Pioneers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPioneers.length > 0 ? (
          filteredPioneers.map((pioneer) => (
            <Card key={pioneer.id} className="relative group">
              <div className="flex gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF9619] to-[#91B9B4] rounded-xl transform rotate-6"></div>
                  <img
                    src={pioneer.image_url}
                    alt={pioneer.name}
                    className="relative w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">{pioneer.name}</h3>
                  <p className="text-[#FAC39B] mb-2">{pioneer.title}</p>
                  <p className="text-gray-400 mb-4">{pioneer.years}</p>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#FAC39B]" />
                    <span className="text-gray-300 text-sm">
                      {pioneer.achievements?.length || 0} إنجازات
                    </span>
                    <span className="mx-2 text-gray-600">•</span>
                    <span className="text-gray-300 text-sm">
                      {pioneer.books?.length || 0} مؤلفات
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditPioneer(pioneer)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="تعديل"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeletePioneer(pioneer)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  title="حذف"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا يوجد رواد تراث مضافين حالياً</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddEditPioneer
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handlePioneerSubmit}
        pioneer={selectedPioneer}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="الرائد"
      />
    </div>
  );
}