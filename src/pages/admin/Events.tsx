import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../lib/supabase';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import AddEditEvent from './components/AddEditEvent';
import DeleteConfirmation from './components/DeleteConfirmation';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

   
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      addToast('حدث خطأ أثناء تحميل الفعاليات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteEvent = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleEventSubmit = async (data: any) => {
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, data);
        addToast('تم تحديث الفعالية بنجاح', 'success');
      } else {
        await createEvent(data);
        addToast('تم إضافة الفعالية بنجاح', 'success');
      }
      loadEvents();
      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      addToast('حدث خطأ أثناء حفظ الفعالية', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(selectedEvent.id);
      addToast('تم حذف الفعالية بنجاح', 'success');
      loadEvents();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      addToast('حدث خطأ أثناء حذف الفعالية', 'error');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const upcomingEvents = events.filter(event => 
    new Date(event.date) >= new Date() && event.status === 'published'
  );

  const cities = [...new Set(events.map(event => event.city))];
  const totalParticipants = events.reduce((acc, event) => acc + event.participants || 0, 0);

  return (
    <div className="space-y-5 pb-8" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة الفعاليات</h1>
          <p className="text-gray-500 text-sm mt-0.5">{events.length} فعالية إجمالاً</p>
        </div>
        <button onClick={handleAddEvent}
          className="flex items-center gap-2 px-4 py-2 bg-[#FAC39B] text-[#0F2837] rounded-xl font-medium hover:bg-[#FF9619] transition-all text-sm">
          <Plus className="w-4 h-4" />إضافة فعالية
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: 'الفعاليات القادمة', value: upcomingEvents.length, color: '#FAC39B' },
          { icon: MapPin,   label: 'المدن',              value: cities.length,         color: '#91B9B4' },
          { icon: Users,    label: 'المشاركين',          value: totalParticipants,     color: '#A78BFA' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-3 bg-[#0A1B26] border border-white/8 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold text-white">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث في الفعاليات..."
          className="w-full bg-[#0A1B26] border border-white/8 text-white rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
      </div>

      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">عنوان الفعالية</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">التاريخ</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">المدينة</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">المشاركين</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">الحالة</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{event.title}</td>
                    <td className="px-4 py-3 text-sm text-white">
                      {new Date(event.date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{event.city}</td>
                    <td className="px-4 py-3 text-sm text-white">
                      {event.participants || 0} / {event.max_participants}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        event.status === 'published' 
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {event.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditEvent(event)} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteEvent(event)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-gray-500 text-sm">لا توجد فعاليات بعد</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditEvent
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleEventSubmit}
        event={selectedEvent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="الفعالية"
      />
    </div>
  );
}