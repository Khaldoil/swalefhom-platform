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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة الفعاليات</h1>
          <p className="text-gray-400">إدارة الفعاليات والأنشطة القادمة</p>
        </div>
        <Button onClick={handleAddEvent}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة فعالية جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <Calendar className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الفعاليات القادمة</h3>
          <p className="text-2xl font-bold text-white mt-2">{upcomingEvents.length}</p>
        </Card>
        <Card>
          <MapPin className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">المدن</h3>
          <p className="text-2xl font-bold text-white mt-2">{cities.length}</p>
        </Card>
        <Card>
          <Users className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">المشاركين</h3>
          <p className="text-2xl font-bold text-white mt-2">{totalParticipants}</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <Input
          type="text"
          placeholder="ابحث في الفعاليات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Events Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">عنوان الفعالية</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">التاريخ</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المدينة</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المشاركين</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الحالة</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{event.title}</td>
                    <td className="px-6 py-4 text-white">
                      {new Date(event.date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 text-white">{event.city}</td>
                    <td className="px-6 py-4 text-white">
                      {event.participants || 0} / {event.max_participants}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        event.status === 'published' 
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {event.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditEvent(event)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event)}
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
                    لا توجد فعاليات مضافة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
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