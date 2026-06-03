import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, RefreshCw, FileText, Tag } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-5 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة المدونة</h1>
          <p className="text-gray-500 text-sm mt-0.5">{posts.length} مقال إجمالاً</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { loadPosts(); loadCategories(); }} className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleAddPost}
            className="flex items-center gap-2 px-4 py-2 bg-[#FAC39B] text-[#0F2837] rounded-xl font-medium hover:bg-[#FF9619] transition-all text-sm">
            <Plus className="w-4 h-4" />إضافة مقال
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: FileText, label: 'الإجمالي',  value: posts.length,    color: '#FAC39B' },
          { icon: Eye,      label: 'منشورة',    value: publishedCount,   color: '#34D399' },
          { icon: EyeOff,   label: 'مسودة',     value: draftCount,       color: '#FBBF24' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-3 bg-[#0A1B26] border border-white/8 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-[#0A1B26] border border-white/8 rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في المقالات..."
              className="w-full bg-white/5 border border-white/8 text-white rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FAC39B]/40 transition-all" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition-all ${showFilters ? 'bg-[#FAC39B]/10 border-[#FAC39B]/30 text-[#FAC39B]' : 'bg-white/5 border-white/8 text-gray-400 hover:text-white'}`}>
            <Filter className="w-4 h-4" />تصفية
          </button>
        </div>
        {showFilters && categories.length > 0 && (
          <div className="pt-3 border-t border-white/8">
            <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1"><Tag className="w-3 h-3" />التصنيف</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory(null)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all ${!selectedCategory ? 'bg-[#FAC39B]/15 text-[#FAC39B]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>الكل</button>
              {categories.map(c => (
                <button key={c.id} onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-all ${selectedCategory === c.id ? 'bg-[#FAC39B]/15 text-[#FAC39B]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-[#0A1B26] border border-white/8 rounded-2xl">
          <FileText className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{searchQuery || selectedCategory ? 'لا توجد نتائج' : 'لا توجد مقالات بعد'}</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="group bg-[#0A1B26] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={post.image_url || 'https://images.unsplash.com/photo-1583795879453-c83e3a5e2212?q=80&w=600'}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                post.status === 'published' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'
              }`}>
                {post.status === 'published' ? 'منشور' : 'مسودة'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{post.title}</h3>
              {post.author && <p className="text-gray-500 text-xs mb-2">{post.author}</p>}
              <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center gap-1.5 pt-3 border-t border-white/8">
                <button onClick={() => handleStatusChange(post, post.status === 'published' ? 'draft' : 'published')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-all ${
                    post.status === 'published' ? 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20' : 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                  }`}>
                  {post.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {post.status === 'published' ? 'إخفاء' : 'نشر'}
                </button>
                <button onClick={() => handleEditPost(post)}
                  className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDeletePost(post)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

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