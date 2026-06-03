import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Award, Search, MapPin, BookOpen, Star, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import AddEditPioneer from './components/AddEditPioneer';
import DeleteConfirmation from './components/DeleteConfirmation';

interface Pioneer {
  id: string; name: string; title?: string; years?: string;
  image_url?: string; region?: string;
  achievements?: string[]; books?: string[];
  bio?: string; specialty?: string;
}

export default function Pioneers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPioneer, setSelectedPioneer] = useState<Pioneer | null>(null);
  const [pioneers, setPioneers] = useState<Pioneer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('pioneers').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      setPioneers((data || []) as Pioneer[]);
    } catch (err) {
      console.error(err); addToast('حدث خطأ أثناء تحميل رواد التراث', 'error');
    } finally { setIsLoading(false); }
  }, [addToast]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (selectedPioneer) {
        const { error } = await supabase.from('pioneers').update(data).eq('id', selectedPioneer.id);
        if (error) throw error;
        addToast('تم تحديث الرائد بنجاح', 'success');
      } else {
        const { error } = await supabase.from('pioneers').insert([data]);
        if (error) throw error;
        addToast('تم إضافة الرائد بنجاح', 'success');
      }
      load(); setIsAddEditModalOpen(false);
    } catch (err) { console.error(err); addToast('حدث خطأ أثناء الحفظ', 'error'); }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPioneer) return;
    try {
      const { error } = await supabase.from('pioneers').delete().eq('id', selectedPioneer.id);
      if (error) throw error;
      addToast('تم حذف الرائد', 'success');
      load(); setIsDeleteModalOpen(false);
    } catch (err) { console.error(err); addToast('حدث خطأ أثناء الحذف', 'error'); }
  };

  const filtered = pioneers.filter(p =>
    (p.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.specialty ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5 pb-8" dir="rtl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">رواد التراث</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pioneers.length} رائد مسجّل</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setSelectedPioneer(null); setIsAddEditModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FAC39B] text-[#0F2837] rounded-xl font-medium hover:bg-[#FF9619] transition-all text-sm">
            <Plus className="w-4 h-4" />إضافة رائد
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم أو التخصص..."
          className="w-full bg-[#0A1B26] border border-white/8 text-white rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Award className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{searchQuery ? 'لا توجد نتائج' : 'لا يوجد رواد مضافون بعد'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(pioneer => (
            <div key={pioneer.id}
              className="group bg-[#0A1B26] border border-white/8 rounded-2xl p-5 flex gap-4 hover:border-white/15 transition-all relative overflow-hidden">

              {/* Accent strip */}
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#FAC39B] to-[#91B9B4] rounded-r-2xl" />

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9619]/30 to-[#91B9B4]/30 rounded-xl" />
                {pioneer.image_url ? (
                  <img src={pioneer.image_url} alt={pioneer.name}
                    className="relative w-20 h-20 object-cover rounded-xl" />
                ) : (
                  <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-[#FAC39B]/20 to-[#91B9B4]/20 flex items-center justify-center">
                    <Award className="w-8 h-8 text-[#FAC39B]/60" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base mb-0.5 truncate">{pioneer.name}</h3>
                {pioneer.title && <p className="text-[#FAC39B] text-xs mb-1 truncate">{pioneer.title}</p>}
                {pioneer.specialty && <p className="text-gray-400 text-xs mb-2">{pioneer.specialty}</p>}

                <div className="flex flex-wrap gap-2 mt-2">
                  {pioneer.region && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-white/4 px-2 py-1 rounded-lg">
                      <MapPin className="w-3 h-3" />{pioneer.region}
                    </span>
                  )}
                  {pioneer.years && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-white/4 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3" />{pioneer.years}
                    </span>
                  )}
                  {(pioneer.achievements?.length ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-white/4 px-2 py-1 rounded-lg">
                      <Award className="w-3 h-3" />{pioneer.achievements!.length} إنجاز
                    </span>
                  )}
                  {(pioneer.books?.length ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-white/4 px-2 py-1 rounded-lg">
                      <BookOpen className="w-3 h-3" />{pioneer.books!.length} مؤلف
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => { setSelectedPioneer(pioneer); setIsAddEditModalOpen(true); }}
                  className="p-2 bg-white/8 hover:bg-white/15 rounded-lg transition-colors text-gray-300 hover:text-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => { setSelectedPioneer(pioneer); setIsDeleteModalOpen(true); }}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditPioneer isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)}
        onSave={() => { load(); setIsAddEditModalOpen(false); }} pioneer={selectedPioneer} />
      <DeleteConfirmation isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm} itemType="الرائد" />
    </div>
  );
}
