import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Tag,
  Book,
  Calendar,
  ChevronLeft,
  ArrowRight,
  Heart,
  Moon,
  Landmark,
  Gamepad2,
  Quote,
  Bookmark,
  Users,
  FileText,
  Image as ImageIcon,
  File,
  Video,
  Coffee,
  ShoppingBag,
  Leaf,
  Cloud,
  Utensils,
  Shirt,
  AlertTriangle,
  Library,
  BookOpen
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import DeleteConfirmation from './components/DeleteConfirmation';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  content_type: 'story' | 'blog' | 'gallery' | 'glossary' | 'book';
  stories_count: number;
  created_at: string;
  updated_at: string;
  display_order: number;
  parent_id?: string;
}

const contentTypes = [
  { id: 'story', name: 'القصص', icon: Book },
  { id: 'blog', name: 'المدونة', icon: FileText },
  { id: 'gallery', name: 'المعرض', icon: ImageIcon },
  { id: 'glossary', name: 'المسرد', icon: Book },
  { id: 'book', name: 'الكتب', icon: Library }
];

const icons = {
  // Story Icons
  book: Book,
  landmark: Landmark,
  heart: Heart,
  moon: Moon,
  gamepad2: Gamepad2,
  quote: Quote,
  
  // Blog Icons
  bookmark: Bookmark,
  users: Users,
  fileText: FileText,
  
  // Gallery Icons
  image: ImageIcon,
  file: File,
  video: Video,
  
  // Glossary Icons
  coffee: Coffee,
  'shopping-bag': ShoppingBag,
  leaf: Leaf,
  cloud: Cloud,
  utensils: Utensils,
  shirt: Shirt,
  
  // Book Icons
  library: Library,
  'book-open': BookOpen
};

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => void;
  category?: Category;
  selectedContentType: string;
}

function AddEditCategoryModal({ isOpen, onClose, onSubmit, category, selectedContentType }: AddEditCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'book',
    content_type: selectedContentType || 'story',
    display_order: 0
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
        content_type: category.content_type,
        display_order: category.display_order
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'book',
        content_type: selectedContentType || 'story',
        display_order: 0
      });
    }
  }, [category, selectedContentType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Filter icons based on content type
  const getRelevantIcons = () => {
    switch(formData.content_type) {
      case 'story':
        return ['book', 'landmark', 'heart', 'moon', 'gamepad2', 'quote'];
      case 'blog':
        return ['bookmark', 'users', 'fileText'];
      case 'gallery':
        return ['image', 'file', 'video'];
      case 'glossary':
        return ['coffee', 'shopping-bag', 'leaf', 'cloud', 'utensils', 'shirt'];
      case 'book':
        return ['library', 'book-open', 'book', 'bookmark'];
      default:
        return Object.keys(icons);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="اسم التصنيف"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="أدخل اسم التصنيف"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            نوع المحتوى
          </label>
          <div className="grid grid-cols-2 gap-4">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, content_type: type.id as any })}
                  className={`flex items-center gap-2 p-4 rounded-lg transition-all duration-300 ${
                    formData.content_type === type.id
                      ? 'bg-[#FAC39B] text-[#0F2837]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            وصف التصنيف
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] min-h-[100px]"
            placeholder="أدخل وصفاً مختصراً للتصنيف"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            الأيقونة
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {getRelevantIcons().map((key) => {
              const Icon = icons[key as keyof typeof icons];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: key })}
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    formData.icon === key
                      ? 'bg-[#FAC39B] text-[#0F2837]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto" />
                </button>
              );
            })}
          </div>
        </div>

        <Input
          type="number"
          label="ترتيب العرض"
          value={formData.display_order}
          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
          placeholder="أدخل ترتيب العرض"
          required
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" className="w-full sm:w-auto">
            {category ? 'حفظ التغييرات' : 'إضافة التصنيف'}
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

function CategoryDetailsModal({ isOpen, onClose, category, onEdit, onDelete }: CategoryDetailsModalProps) {
  const Icon = icons[category.icon as keyof typeof icons] || Book;
  const contentType = contentTypes.find(t => t.id === category.content_type);
  
  const getContentPageUrl = () => {
    switch (category.content_type) {
      case 'story':
        return '/admin/stories';
      case 'blog':
        return '/admin/blog';
      case 'gallery':
        return '/admin/gallery';
      case 'glossary':
        return '/admin/glossary';
      case 'book':
        return '/admin/books';
      default:
        return '/admin';
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category.name}
    >
      <div className="space-y-6">
        {/* Icon and Basic Info */}
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-xl bg-[#FAC39B]/10 flex items-center justify-center transform rotate-3">
            <Icon className="w-8 h-8 text-[#FAC39B]" />
          </div>
          <div className="flex-grow">
            <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
            <p className="text-gray-300">{category.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">عدد المحتويات</p>
            <p className="text-2xl font-bold text-white">{category.stories_count || 0}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">نوع المحتوى</p>
            <div className="flex items-center gap-2">
              {contentType && (
                <>
                  <contentType.icon className="w-5 h-5 text-[#FAC39B]" />
                  <span className="text-white">{contentType.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => {
              window.location.href = getContentPageUrl();
            }}
            className="w-full sm:w-auto"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            عرض المحتويات
          </Button>
          <Button onClick={onEdit} className="w-full sm:w-auto">
            <Edit className="w-5 h-5 ml-2" />
            تعديل التصنيف
          </Button>
          <Button 
            variant="danger" 
            onClick={onDelete}
            className="w-full sm:w-auto"
          >
            <Trash2 className="w-5 h-5 ml-2" />
            حذف التصنيف
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('content_type', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      addToast('حدث خطأ أثناء تحميل التصنيفات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsAddEditModalOpen(true);
    setIsDetailsModalOpen(false);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
    setIsDetailsModalOpen(false);
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailsModalOpen(true);
  };

  const handleCategorySubmit = async (data: Partial<Category>) => {
    try {
      if (selectedCategory) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', selectedCategory.id);

        if (error) throw error;
        addToast('تم تحديث التصنيف بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([data]);

        if (error) throw error;
        addToast('تم إضافة التصنيف بنجاح', 'success');
      }
      loadCategories();
      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      addToast('حدث خطأ أثناء حفظ التصنيف', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedCategory) return;

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id);

      if (error) throw error;
      addToast('تم حذف التصنيف بنجاح', 'success');
      loadCategories();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast('حدث خطأ أثناء حذف التصنيف', 'error');
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesContentType = !selectedContentType || category.content_type === selectedContentType;
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesContentType && matchesSearch;
  });

  // Group categories by content type
  const groupedCategories = filteredCategories.reduce((acc, category) => {
    if (!acc[category.content_type]) {
      acc[category.content_type] = [];
    }
    acc[category.content_type].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  // Get content type counts
  const contentTypeCounts = categories.reduce((acc, category) => {
    acc[category.content_type] = (acc[category.content_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
          <h1 className="text-3xl font-bold text-white mb-2">إدارة التصنيفات</h1>
          <p className="text-gray-400">إدارة تصنيفات المحتوى في الموقع</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة تصنيف جديد
        </Button>
      </div>

      {/* Content Type Filter */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <button
          onClick={() => setSelectedContentType(null)}
          className={`p-4 rounded-xl transition-all duration-300 ${
            selectedContentType === null
              ? 'bg-[#FAC39B] text-[#0F2837]'
              : 'bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          <Tag className="w-6 h-6 mb-2" />
          <div className="text-lg font-medium">الكل</div>
          <div className="text-sm opacity-75">{categories.length} تصنيف</div>
        </button>
        {contentTypes.map((type) => {
          const count = contentTypeCounts[type.id] || 0;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedContentType(selectedContentType === type.id ? null : type.id)}
              className={`p-4 rounded-xl transition-all duration-300 ${
                selectedContentType === type.id
                  ? 'bg-[#FAC39B] text-[#0F2837]'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <type.icon className="w-6 h-6 mb-2" />
              <div className="text-lg font-medium">{type.name}</div>
              <div className="text-sm opacity-75">{count} تصنيف</div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <Card className="mb-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="ابحث في التصنيفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </Card>

      {/* Categories by Content Type */}
      {Object.keys(groupedCategories).length > 0 ? (
        Object.entries(groupedCategories).map(([contentType, categories]) => {
          const typeInfo = contentTypes.find(t => t.id === contentType);
          return (
            <div key={contentType} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                {typeInfo && <typeInfo.icon className="w-6 h-6 text-[#FAC39B]" />}
                <h2 className="text-xl font-bold text-white">
                  {typeInfo ? typeInfo.name : contentType}
                </h2>
                <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {categories.length} تصنيف
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                  const Icon = icons[category.icon as keyof typeof icons] || Book;
                  
                  return (
                    <Card 
                      key={category.id} 
                      className="relative group cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
                      onClick={() => handleViewCategory(category)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#FAC39B]/10 flex items-center justify-center transform rotate-3 transition-transform group-hover:rotate-6">
                          <Icon className="w-6 h-6 text-[#FAC39B]" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">{category.name}</h3>
                          </div>
                          <p className="text-gray-400 mb-4">{category.description}</p>
                          <div className="text-sm text-gray-500">
                            {category.stories_count || 0} محتوى
                          </div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {/* Add Category Button */}
                <Card 
                  className="border-2 border-dashed border-white/20 hover:border-[#FAC39B]/30 flex items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  onClick={() => {
                    setSelectedContentType(contentType as any);
                    handleAddCategory();
                  }}
                >
                  <div className="text-center py-8">
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 font-medium">إضافة تصنيف جديد</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {typeInfo ? `إضافة تصنيف جديد إلى ${typeInfo.name}` : 'إضافة تصنيف جديد'}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <Tag className="w-16 h-16 text-[#FAC39B] mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">لا توجد تصنيفات</h2>
          <p className="text-gray-400 text-center">
            لم يتم العثور على أي تصنيفات. يمكنك إضافة تصنيف جديد من خلال الزر أعلاه.
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddEditCategoryModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleCategorySubmit}
        category={selectedCategory || undefined}
        selectedContentType={selectedContentType || 'story'}
      />

      {/* Details Modal */}
      {selectedCategory && isDetailsModalOpen && (
        <CategoryDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          category={selectedCategory}
          onEdit={() => handleEditCategory(selectedCategory)}
          onDelete={() => handleDeleteCategory(selectedCategory)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="التصنيف"
      />
    </div>
  );
}