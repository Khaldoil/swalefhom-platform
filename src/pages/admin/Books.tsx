import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Book, BookOpen, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import DeleteConfirmation from './components/DeleteConfirmation';
import ImageUpload from '../../components/ImageUpload';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  download_url: string;
  category_id: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface AddEditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Book>) => void;
  book?: Book;
}

function AddEditBookModal({ isOpen, onClose, onSubmit, book }: AddEditBookModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: '',
    download_url: '',
    category_id: '',
    status: 'draft'
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        cover_url: book.cover_url || '',
        download_url: book.download_url || '',
        category_id: book.category_id || '',
        status: book.status || 'draft'
      });
    } else {
      setFormData({
        title: '',
        author: '',
        description: '',
        cover_url: '',
        download_url: '',
        category_id: '',
        status: 'draft'
      });
    }
  }, [book]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('content_type', 'book')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, cover_url: url }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={book ? 'تعديل كتاب' : 'إضافة كتاب جديد'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="عنوان الكتاب"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Input
          label="المؤلف"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            وصف الكتاب
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] min-h-[100px]"
            required
          />
        </div>

        <Input
          label="رابط تحميل الكتاب"
          value={formData.download_url}
          onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
          placeholder="https://example.com/book.pdf"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            التصنيف
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B]"
            required
          >
            <option value="" className="bg-[#0F2837]">اختر التصنيف</option>
            {categories.map(category => (
              <option 
                key={category.id} 
                value={category.id} 
                className="bg-[#0F2837]"
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            صورة الغلاف
          </label>
          <ImageUpload
            onUpload={handleImageUpload}
            currentImage={formData.cover_url}
            onRemove={() => setFormData({ ...formData, cover_url: '' })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            الحالة
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B]"
          >
            <option value="draft" className="bg-[#0F2837]">مسودة</option>
            <option value="published" className="bg-[#0F2837]">منشور</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            {book ? 'حفظ التغييرات' : 'إضافة الكتاب'}
          </Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Books() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('content_type', 'book')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      addToast('حدث خطأ أثناء تحميل التصنيفات', 'error');
    }
  };

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
      addToast('حدث خطأ أثناء تحميل الكتب', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = () => {
    setSelectedBook(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteBook = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const handleBookSubmit = async (data: Partial<Book>) => {
    try {
      if (selectedBook) {
        const { error } = await supabase
          .from('books')
          .update(data)
          .eq('id', selectedBook.id);

        if (error) throw error;
        addToast('تم تحديث الكتاب بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('books')
          .insert([data]);

        if (error) throw error;
        addToast('تم إضافة الكتاب بنجاح', 'success');
      }
      loadBooks();
      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error('Error saving book:', error);
      addToast('حدث خطأ أثناء حفظ الكتاب', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedBook) return;

      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', selectedBook.id);

      if (error) throw error;
      addToast('تم حذف الكتاب بنجاح', 'success');
      loadBooks();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting book:', error);
      addToast('حدث خطأ أثناء حذف الكتاب', 'error');
    }
  };

  const handleStatusChange = async (book: Book, newStatus: 'draft' | 'published') => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ status: newStatus })
        .eq('id', book.id);

      if (error) throw error;
      addToast(`تم ${newStatus === 'published' ? 'نشر' : 'إخفاء'} الكتاب بنجاح`, 'success');
      loadBooks();
    } catch (error) {
      console.error('Error updating book status:', error);
      addToast('حدث خطأ أثناء تحديث حالة الكتاب', 'error');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = !selectedCategory || book.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));
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
          <h1 className="text-3xl font-bold text-white mb-2">إدارة مكتبة الكتب</h1>
          <p className="text-gray-400">إدارة الكتب والمراجع التراثية</p>
        </div>
        <Button onClick={handleAddBook}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة كتاب جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <Eye className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الكتب المنشورة</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {books.filter(book => book.status === 'published').length}
          </p>
        </Card>
        <Card>
          <EyeOff className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">الكتب المخفية</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {books.filter(book => book.status === 'draft').length}
          </p>
        </Card>
        <Card>
          <Filter className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">التصنيفات</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {categories.length}
          </p>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <div className="flex gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="ابحث في الكتب..."
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
                {categories.map((category) => (
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

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <Card key={book.id} className="group">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4">
                <img
                  src={book.cover_url || 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1000'}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">{book.title}</h3>
                <p className="text-gray-400 text-sm mb-3">
                  {book.author}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    book.status === 'published'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {book.status === 'published' ? 'منشور' : 'مسودة'}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={book.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="عرض الكتاب"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleStatusChange(book, book.status === 'published' ? 'draft' : 'published')}
                      className={`p-2 rounded-lg transition-colors ${
                        book.status === 'published'
                          ? 'hover:bg-yellow-500/10 text-yellow-400'
                          : 'hover:bg-green-500/10 text-green-400'
                      }`}
                      title={book.status === 'published' ? 'إخفاء' : 'نشر'}
                    >
                      {book.status === 'published' ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditBook(book)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="تعديل"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Book className="w-16 h-16 text-[#FAC39B] mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">لا توجد كتب</h2>
            <p className="text-gray-400 text-center">
              لم يتم العثور على أي كتب. يمكنك إضافة كتاب جديد من خلال الزر أعلاه.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddEditBookModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleBookSubmit}
        book={selectedBook || undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="الكتاب"
      />
    </div>
  );
}