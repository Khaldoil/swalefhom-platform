import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Book,
  Search,
  MapPin,
  Tag,
  Clock,
  ArrowLeft,
  BookOpen,
  FileText,
  Volume2,
  Video,
  Film,
  Heart,
  Star,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'written' | 'audio' | 'video'>('all');
  const [stories, setStories] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [storiesRef, storiesInView] = useInView({ threshold: 0.2, triggerOnce: true });

  const formats = [
    { id: 'all', name: 'الكل', icon: Book },
    { id: 'written', name: 'مكتوبة', icon: FileText },
    { id: 'audio', name: 'صوتية', icon: Volume2 },
    { id: 'video', name: 'مرئية', icon: Video }
  ];

  useEffect(() => {
    loadStories();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('content_type', 'story')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*, categories(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (err) {
      console.error('Error loading stories:', err);
      setError('حدث خطأ أثناء تحميل القصص');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesCategory = !selectedCategory || story.category_id === selectedCategory;
    const matchesFormat = selectedFormat === 'all' || story.format === selectedFormat;
    const matchesSearch = !searchQuery ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.excerpt && story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesFormat && matchesSearch;
  });

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
              onClick={loadStories}
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

  if (stories.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0F2837]">
        <SEO
          title="قصص من أجدادنا | سواليفهم"
          description="اكتشف تاريخنا من خلال قصص وذكريات الأجيال السابقة"
        />
        <div className="flex-grow pt-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative inline-block mb-8">
              <Book className="w-20 h-20 text-[#FAC39B]" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#FF9619] animate-pulse" />
            </div>

            <h1 className="text-5xl font-bold text-white mb-6">نجمع القصص حالياً</h1>
            <p className="text-xl text-gray-300 mb-12">
              نعمل على جمع وتوثيق قصص أجدادنا من مختلف مناطق المملكة. شاركنا في هذه الرحلة وساهم في حفظ تراثنا للأجيال القادمة.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: FileText, title: 'قصص مكتوبة', desc: 'اكتب القصص كما رويت لك' },
                { icon: Volume2, title: 'قصص صوتية', desc: 'سجل القصص بصوت الراوي' },
                { icon: Video, title: 'قصص مرئية', desc: 'وثق القصص بالصوت والصورة' }
              ].map((format, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-[#FF9619]/20 rounded-2xl flex items-center justify-center mb-4">
                    <format.icon className="w-8 h-8 text-[#FF9619]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{format.title}</h3>
                  <p className="text-gray-400">{format.desc}</p>
                </div>
              ))}
            </div>

            <Link
              to="/apply"
              className="inline-flex items-center gap-3 bg-[#FF9619] text-[#0F2837] px-8 py-4 rounded-full text-lg font-bold hover:bg-[#FAC39B] transition-all hover:scale-105"
            >
              <Star className="w-5 h-5" />
              شارك قصتك الآن
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2837]">
      <SEO
        title="قصص من أجدادنا | سواليفهم"
        description="اكتشف تاريخنا من خلال قصص وذكريات الأجيال السابقة"
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
                <BookOpen className="w-10 h-10 text-[#FF9619]" />
              </div>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl font-bold text-white mb-4">
              قصص من أجدادنا
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              اكتشف تاريخنا من خلال قصص وذكريات الأجيال السابقة
            </motion.p>

            {/* Format Filter */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
                    selectedFormat === format.id
                      ? 'bg-[#FF9619] text-white border-[#FF9619]'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <format.icon className="w-4 h-4" />
                  {format.name}
                </button>
              ))}
            </motion.div>

            {/* Search */}
            <motion.div variants={fadeInUp} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في القصص..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FAC39B] focus:bg-white/10"
                />
              </div>
            </motion.div>

            {/* Categories */}
            {categories.length > 0 && (
              <motion.div variants={fadeInUp}>
                <h3 className="text-sm font-bold text-gray-400 mb-4">التصنيفات</h3>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selectedCategory === null
                        ? 'bg-[#91B9B4] text-white border-[#91B9B4]'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    الكل ({stories.length})
                  </button>
                  {categories.map((category) => {
                    const categoryStories = stories.filter(s => s.category_id === category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          selectedCategory === category.id
                            ? 'bg-[#91B9B4] text-white border-[#91B9B4]'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {category.name} ({categoryStories.length})
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </section>

      {/* Stories Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={storiesRef}
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={storiesInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <motion.div
                  key={story.id}
                  variants={fadeInUp}
                >
                  <Link
                    to={`/stories/${story.id}`}
                    className="group block bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={story.image_url || 'https://images.unsplash.com/photo-1583795879453-c83e3a5e2212?q=80&w=1000'}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className="bg-[#FF9619]/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                          {story.format === 'video' && <><Film className="w-3 h-3" /> مرئية</>}
                          {story.format === 'audio' && <><Volume2 className="w-3 h-3" /> صوتية</>}
                          {story.format === 'written' && <><FileText className="w-3 h-3" /> مكتوبة</>}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Category badge */}
                      {story.categories && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#91B9B4] bg-[#91B9B4]/10 px-2 py-1 rounded-lg mb-3">
                          <Tag className="w-3 h-3" />{story.categories.name}
                        </span>
                      )}

                      <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-[#FAC39B] transition-colors mb-2">
                        {story.title}
                      </h3>

                      {/* Teller name */}
                      {story.metadata?.teller_name && (
                        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-[#FAC39B]/20 inline-flex items-center justify-center flex-shrink-0">
                            <span className="text-[#FAC39B] text-xs leading-none">✦</span>
                          </span>
                          {story.metadata.teller_name}
                        </p>
                      )}

                      {story.excerpt && (
                        <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                          {story.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-white/8">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {story.region && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#FAC39B]" />{story.region}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[#FAC39B] text-xs font-medium">
                          <span>
                            {story.format === 'video' ? 'شاهد' : story.format === 'audio' ? 'استمع' : 'اقرأ'}
                          </span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Book className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">لا توجد قصص</h3>
              <p className="text-gray-400">جرب تعديل معايير البحث أو التصفية</p>
            </div>
          )}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
