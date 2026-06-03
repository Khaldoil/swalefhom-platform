import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, AlertTriangle, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import DeleteConfirmation from './components/DeleteConfirmation';
import ImageUpload from '../../components/ImageUpload';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  category_id: string;
  author: string;
  status: 'draft' | 'published';
  created_at: string;
  categories?: {
    id: string;
    name: string;
    description: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface AddEditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<BlogPost>) => void;
  post?: BlogPost;
}

function AddEditPostModal({ isOpen, onClose, onSubmit, post }: AddEditPostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    category_id: '',
    author: '',
    status: 'draft'
  });
  const [categories, setCategories] = useState<Category[]>([]);

   
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        image_url: post.image_url || '',
        category_id: post.category_id || '',
        author: post.author || '',
        status: post.status || 'draft'
      });
    } else {
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        image_url: '',
        category_id: '',
        author: '',
        status: 'draft'
      });
    }
  }, [post]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('content_type', 'blog')
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
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post ? 'تعديل مقال' : 'إضافة مقال جديد'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="عنوان المقال"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Input
          label="الكاتب"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            المقتطف
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] min-h-[100px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            المحتوى
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] min-h-[200px]"
            required
          />
        </div>

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
            صورة المقال
          </label>
          <ImageUpload
            onUpload={handleImageUpload}
            currentImage={formData.image_url}
            onRemove={() => setFormData({ ...formData, image_url: '' })}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            {post ? 'حفظ التغييرات' : 'إضافة المقال'}
          </Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

   
  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('content_type', 'blog')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      addToast('حدث خطأ أثناء تحميل التصنيفات', 'error');
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      addToast('حدث خطأ أثناء تحميل المقالات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = () => {
    setSelectedPost(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsAddEditModalOpen(true);
  };

  const handleDeletePost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };

  const handlePostSubmit = async (data: Partial<BlogPost>) => {
    try {
      if (selectedPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(data)
          .eq('id', selectedPost.id);

        if (error) throw error;
        addToast('تم تحديث المقال بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([data]);

        if (error) throw error;
        addToast('تم إضافة المقال بنجاح', 'success');
      }
      loadPosts();
      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error('Error saving post:', error);
      addToast('حدث خطأ أثناء حفظ المقال', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedPost) return;

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', selectedPost.id);

      if (error) throw error;
      addToast('تم حذف المقال بنجاح', 'success');
      loadPosts();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      addToast('حدث خطأ أثناء حذف المقال', 'error');
    }
  };

  const handleStatusChange = async (post: BlogPost, newStatus: 'draft' | 'published') => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: newStatus })
        .eq('id', post.id);

      if (error) throw error;
      addToast(`تم ${newStatus === 'published' ? 'نشر' : 'إخفاء'} المقال بنجاح`, 'success');
      loadPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
      addToast('حدث خطأ أثناء تحديث حالة المقال', 'error');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = !selectedCategory || post.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
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
          <h1 className="text-3xl font-bold text-white mb-2">إدارة المدونة</h1>
          <p className="text-gray-400">إدارة المقالات والمحتوى</p>
        </div>
        <Button onClick={handleAddPost}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة مقال جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <Eye className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">المقالات المنشورة</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {posts.filter(post => post.status === 'published').length}
          </p>
        </Card>
        <Card>
          <EyeOff className="w-6 h-6 text-[#FAC39B] mb-4" />
          <h3 className="text-sm font-medium text-gray-400">المقالات المخفية</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {posts.filter(post => post.status === 'draft').length}
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
              placeholder="ابحث في المقالات..."
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

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="group">
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <img
                src={post.image_url || 'https://images.unsplash.com/photo-1583795879453-c83e3a5e2212?q=80&w=1000'}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">{post.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  post.status === 'published'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {post.status === 'published' ? 'منشور' : 'مسودة'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(post, post.status === 'published' ? 'draft' : 'published')}
                    className={`p-2 rounded-lg transition-colors ${
                      post.status === 'published'
                        ? 'hover:bg-yellow-500/10 text-yellow-400'
                        : 'hover:bg-green-500/10 text-green-400'
                    }`}
                    title={post.status === 'published' ? 'إخفاء' : 'نشر'}
                  >
                    {post.status === 'published' ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditPost(post)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    title="تعديل"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AddEditPostModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handlePostSubmit}
        post={selectedPost || undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="المقال"
      />
    </div>
  );
}