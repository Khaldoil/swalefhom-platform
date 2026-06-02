import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Book,
  Search,
  BookOpen,
  Tag,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  FileText,
  Sparkles,
  Library as LibraryIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const booksPerPage = 12;

  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [booksRef, booksInView] = useInView({ threshold: 0.2, triggerOnce: true });

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
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*, categories(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      console.error('Error loading books:', err);
      setError('حدث خطأ أثناء تحميل الكتب');
    } finally {
      setIsLoading(false);
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

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadBooks}
              className="text-[#FAC39B] hover:text-white transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2837]">
      <SEO
        title="مكتبة الكتب التراثية | سواليفهم"
        description="مجموعة من الكتب والمراجع المتعلقة بالتراث والثقافة السعودية"
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <motion.div
          ref={heroRef}
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="text-center mb-12">
            <motion.div variants={fadeInUp} className="inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF9619]/20 to-[#FAC39B]/20 rounded-2xl flex items-center justify-center">
                <LibraryIcon className="w-10 h-10 text-[#FF9619]" />
              </div>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl font-bold text-white mb-4">
              مكتبة الكتب
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              مجموعة من الكتب والمراجع المتعلقة بالتراث والثقافة السعودية
            </motion.p>

            {/* Stats */}
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-8 text-sm mb-8">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FAC39B]" />
                <span className="text-gray-400">
                  <span className="font-bold text-white">{books.length}</span> كتاب
                </span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FAC39B]" />
                <span className="text-gray-400">
                  <span className="font-bold text-white">{categories.length}</span> تصنيف
                </span>
              </div>
            </motion.div>

            {/* Search */}
            <motion.div variants={fadeInUp} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الكتب والمؤلفين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FAC39B] focus:bg-white/10"
                />
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-bold text-gray-400 mb-4">التصنيفات</h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedCategory === null
                      ? 'bg-[#FF9619] text-white border-[#FF9619]'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  الكل ({books.length})
                </button>
                {categories.map((category) => {
                  const categoryBooks = books.filter(b => b.category_id === category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        selectedCategory === category.id
                          ? 'bg-[#FF9619] text-white border-[#FF9619]'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {category.name} ({categoryBooks.length})
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Books Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={booksRef}
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={booksInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {currentBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
                {currentBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    variants={fadeInUp}
                    className="group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
                      <div className="aspect-[2/3] overflow-hidden relative">
                        <img
                          src={book.cover_url || 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1000'}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {book.categories && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-[#91B9B4]/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px]">
                              {book.categories.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#FAC39B] transition-colors mb-2">
                          {book.title}
                        </h3>

                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <User className="w-3 h-3 text-[#FAC39B]" />
                          <span className="line-clamp-1">{book.author}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-3 rounded-xl transition-all ${
                      currentPage === 1
                        ? 'text-gray-500 cursor-not-allowed bg-white/5'
                        : 'text-white hover:bg-white/10 bg-white/5'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`w-12 h-12 rounded-xl transition-all font-medium ${
                          currentPage === pageNumber
                            ? 'bg-[#FAC39B] text-[#0F2837]'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-xl transition-all ${
                      currentPage === totalPages
                        ? 'text-gray-500 cursor-not-allowed bg-white/5'
                        : 'text-white hover:bg-white/10 bg-white/5'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">لا توجد كتب</h3>
              <p className="text-gray-400">جرب تعديل معايير البحث أو التصفية</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-[#0F2837] rounded-xl border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0F2837]/95 backdrop-blur-sm px-4 py-3 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-base font-bold text-white line-clamp-1">{selectedBook.title}</h2>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Book Cover */}
                <div className="sm:w-40 flex-shrink-0">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 mb-3">
                    <img
                      src={selectedBook.cover_url || 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1000'}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info Cards */}
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#FF9619]/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-[#FF9619]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-400 text-[10px]">المؤلف</p>
                          <p className="text-white text-xs font-medium truncate">{selectedBook.author}</p>
                        </div>
                      </div>
                    </div>

                    {selectedBook.categories && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[#91B9B4]/20 flex items-center justify-center flex-shrink-0">
                            <Tag className="w-3 h-3 text-[#91B9B4]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-400 text-[10px]">التصنيف</p>
                            <p className="text-white text-xs font-medium truncate">{selectedBook.categories.name}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#FAC39B]/20 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-3 h-3 text-[#FAC39B]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-400 text-[10px]">تاريخ الإضافة</p>
                          <p className="text-white text-xs font-medium">
                            {new Date(selectedBook.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Details */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-[#FAC39B]" />
                      <h4 className="text-sm font-bold text-white">نبذة عن الكتاب</h4>
                    </div>
                    <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                      {selectedBook.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
