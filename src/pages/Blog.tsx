import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, BookOpen, Tag, Clock, Hash, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  category_id: string;
  author: string;
  created_at: string;
  status: 'draft' | 'published';
  categories?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [postsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*, categories(*)')
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .eq('content_type', 'blog')
          .order('display_order', { ascending: true })
      ]);

      if (postsResponse.error) throw postsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setPosts(postsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = !selectedCategory || post.category_id === selectedCategory;
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2837]">
      <SEO
        title="مدونة التراث السعودي | سواليفهم"
        description="مقالات وأبحاث متخصصة في التراث والثقافة السعودية، حوارات مع شخصيات مهمة، ودراسات أكاديمية عن التراث."
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF9619]/20 to-[#FAC39B]/20 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-[#FF9619]" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              المدونة
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              مقالات وأبحاث في التراث والثقافة السعودية
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#FAC39B]" />
                <span className="text-gray-400">
                  <span className="font-bold text-white">{posts.length}</span> مقال
                </span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FAC39B]" />
                <span className="text-gray-400">
                  <span className="font-bold text-white">{categories.length}</span> تصنيف
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في المقالات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FAC39B] focus:bg-white/10"
              />
            </div>
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 mb-4 text-center">التصنيفات</h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border ${
                    selectedCategory === null
                      ? 'bg-[#FF9619] text-white border-[#FF9619]'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  الكل ({posts.length})
                </button>
                {categories.map((category) => {
                  const categoryPosts = posts.filter(p => p.category_id === category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium border ${
                        selectedCategory === category.id
                          ? 'bg-[#FF9619] text-white border-[#FF9619]'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {category.name} ({categoryPosts.length})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Posts Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length > 0 ? (
            <div className="space-y-8">
              {/* Featured Post */}
              {filteredPosts.length > 0 && (
                <Link
                  to={`/blog/${filteredPosts[0].id}`}
                  className="block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    <div className="aspect-video rounded-xl overflow-hidden">
                      <img
                        src={filteredPosts[0].image_url || 'https://images.unsplash.com/photo-1583795879453-c83e3a5e2212?q=80&w=1000'}
                        alt={filteredPosts[0].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      {filteredPosts[0].categories && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 text-sm text-gray-300 w-fit mb-3">
                          {filteredPosts[0].categories.name}
                        </div>
                      )}
                      <h2 className="text-3xl font-bold text-white mb-3">{filteredPosts[0].title}</h2>
                      <p className="text-gray-300 mb-4 line-clamp-3">{filteredPosts[0].excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#FAC39B]" />
                          <span>{filteredPosts[0].author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#FAC39B]" />
                          <span>{new Date(filteredPosts[0].created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#FAC39B]" />
                          <span>{calculateReadingTime(filteredPosts[0].content)} دقيقة</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[#FAC39B]">
                        <span className="font-medium">اقرأ المقال</span>
                        <ArrowLeft className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Regular Posts Grid */}
              {filteredPosts.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.slice(1).map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.id}`}
                      className="block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.image_url || 'https://images.unsplash.com/photo-1583795879453-c83e3a5e2212?q=80&w=1000'}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        {post.categories && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 text-sm text-gray-300 mb-3">
                            {post.categories.name}
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-gray-300 mb-4 line-clamp-2 text-sm">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#FAC39B]" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#FAC39B]" />
                            <span>{calculateReadingTime(post.content)} د</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[#FAC39B]">
                          <span className="font-medium text-sm">اقرأ المزيد</span>
                          <ArrowLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">لا توجد مقالات</h3>
              <p className="text-gray-400">جرب تعديل معايير البحث أو التصفية</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
