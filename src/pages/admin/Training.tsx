import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, Users, Edit, Trash2, RefreshCw } from 'lucide-react';
import { getTrainingCourses, createTrainingCourse, updateTrainingCourse, deleteTrainingCourse } from '../../lib/supabase';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import AddEditTraining from './components/AddEditTraining';
import DeleteConfirmation from './components/DeleteConfirmation';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export default function Training() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

   
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getTrainingCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      addToast('حدث خطأ أثناء تحميل الدورات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteCourse = (course: any) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const handleCourseSubmit = async (data: any) => {
    try {
      if (selectedCourse) {
        await updateTrainingCourse(selectedCourse.id, data);
        addToast('تم تحديث الدورة بنجاح', 'success');
      } else {
        await createTrainingCourse(data);
        addToast('تم إضافة الدورة بنجاح', 'success');
      }
      loadCourses();
      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error('Error saving course:', error);
      addToast('حدث خطأ أثناء حفظ الدورة', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTrainingCourse(selectedCourse.id);
      addToast('تم حذف الدورة بنجاح', 'success');
      loadCourses();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting course:', error);
      addToast('حدث خطأ أثناء حذف الدورة', 'error');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeCourses = courses.filter(course => 
    new Date(course.end_date) >= new Date() && course.status === 'published'
  );

  const totalParticipants = courses.reduce((acc, course) => acc + course.participants || 0, 0);
  const upcomingCourses = courses.filter(course => 
    new Date(course.start_date) > new Date()
  );

  return (
    <div className="space-y-5 pb-8" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة التدريب</h1>
          <p className="text-gray-500 text-sm mt-0.5">{courses.length} دورة إجمالاً</p>
        </div>
        <button onClick={handleAddCourse}
          className="flex items-center gap-2 px-4 py-2 bg-[#FAC39B] text-[#0F2837] rounded-xl font-medium hover:bg-[#FF9619] transition-all text-sm">
          <Plus className="w-4 h-4" />إضافة دورة
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: 'الدورات النشطة', value: activeCourses.length, color: '#34D399' },
          { icon: Users,    label: 'المتدربين',       value: totalParticipants,    color: '#FAC39B' },
          { icon: Calendar, label: 'القادمة',          value: upcomingCourses.length, color: '#A78BFA' },
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
          placeholder="ابحث في الدورات..."
          className="w-full bg-[#0A1B26] border border-white/8 text-white rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
      </div>

      {/* Courses Table */}
      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">عنوان الدورة</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">المدرب</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">التاريخ</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">المتدربين</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">الحالة</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{course.title}</td>
                    <td className="px-4 py-3 text-sm text-white">{course.trainer}</td>
                    <td className="px-4 py-3 text-sm text-white">
                      {new Date(course.start_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {course.participants || 0} / {course.max_participants}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        course.status === 'published' 
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {course.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditCourse(course)} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteCourse(course)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-gray-500 text-sm">لا توجد دورات بعد</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditTraining
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleCourseSubmit}
        course={selectedCourse}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="الدورة"
      />
    </div>
  );
}