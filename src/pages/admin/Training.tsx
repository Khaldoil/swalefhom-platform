import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, Users, Edit, Trash2 } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen">
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة التدريب</h1>
          <p className="text-gray-400">إدارة الدورات التدريبية والمتدربين</p>
        </div>
        <Button onClick={handleAddCourse}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة دورة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <Calendar className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الدورات النشطة</h3>
          <p className="text-2xl font-bold text-white mt-2">{activeCourses.length}</p>
        </Card>
        <Card>
          <Users className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">المتدربين</h3>
          <p className="text-2xl font-bold text-white mt-2">{totalParticipants}</p>
        </Card>
        <Card>
          <Calendar className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الدورات القادمة</h3>
          <p className="text-2xl font-bold text-white mt-2">{upcomingCourses.length}</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <Input
          type="text"
          placeholder="ابحث في الدورات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Courses Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">عنوان الدورة</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المدرب</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">التاريخ</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">المتدربين</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الحالة</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{course.title}</td>
                    <td className="px-6 py-4 text-white">{course.trainer}</td>
                    <td className="px-6 py-4 text-white">
                      {new Date(course.start_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {course.participants || 0} / {course.max_participants}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        course.status === 'published' 
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {course.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditCourse(course)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course)}
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
                    لا توجد دورات مضافة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
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