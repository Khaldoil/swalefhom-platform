import React, { useState, useEffect } from 'react';
import { Users, Book, Award, GraduationCap, Quote, Calendar, Heart, Sparkles, Star, Filter, Search, BookOpen, Library } from 'lucide-react';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SEO from '../components/SEO';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function Pioneers() {
  const [pioneers, setPioneers] = useState<any[]>([]);
  const [filteredPioneers, setFilteredPioneers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPioneer, setSelectedPioneer] = useState<any | null>(null);

  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [pioneersRef, pioneersInView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    loadPioneers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPioneers(pioneers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = pioneers.filter(pioneer =>
        pioneer.name.toLowerCase().includes(query) ||
        pioneer.title.toLowerCase().includes(query) ||
        pioneer.bio.toLowerCase().includes(query)
      );
      setFilteredPioneers(filtered);
    }
  }, [searchQuery, pioneers]);

  const loadPioneers = async () => {
    try {
      const { data, error } = await supabase
        .from('pioneers')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPioneers(data || []);
      setFilteredPioneers(data || []);
    } catch (err) {
      console.error('Error loading pioneers:', err);
      setError('حدث خطأ أثناء تحميل رواد التراث');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPioneerName = (pioneer: any) => {
    const isDeceased = pioneer.years.includes('2011') ||
                      pioneer.years.includes('2022') ||
                      pioneer.name === 'محمد بن عبد العزيز القويعي';
    return (
      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
        {pioneer.name}
        {isDeceased && (
          <span className="text-gray-400 mr-2 text-lg sm:text-xl">
            - رحمه الله
          </span>
        )}
      </h3>
    );
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
              onClick={loadPioneers}
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
    <div className="min-h-screen bg-[#0F2837] pt-20 sm:pt-24">
      <SEO
        title="رواد التراث"
        description="استكشف سير وإنجازات رواد التراث السعودي الذين ساهموا في حفظ وتوثيق الموروث الثقافي"
        keywords="رواد التراث، التراث السعودي، تاريخ المملكة، الموروث الثقافي"
      />
      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        className="relative mb-12 sm:mb-16 lg:mb-20 overflow-hidden"
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 bg-[#FAC39B]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-40 sm:w-80 h-40 sm:h-80 bg-[#FF9619]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <motion.div variants={fadeInUp} className="inline-block mb-6 sm:mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FAC39B] opacity-30 rounded-full blur-3xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-[#FF9619] to-[#FAC39B] p-4 sm:p-6 rounded-2xl sm:rounded-3xl transform rotate-3 hover:rotate-6 transition-transform duration-500">
                  <Award className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-float" />
                </div>
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF9619] animate-pulse" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4"
            >
              <span className="bg-gradient-to-r from-[#FF9619] via-[#FAC39B] to-[#EB5A3C] bg-clip-text text-transparent">
                رواد التراث
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl lg:text-2xl text-[#FAC39B] max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4"
            >
              شخصيات عظيمة ساهمت في حفظ وتوثيق الموروث الثقافي السعودي
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={fadeInUp} className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن رائد تراث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9619]/50 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto px-4"
            >
              {[
                { icon: Users, number: filteredPioneers.length, label: 'رائد تراث', color: '#FF9619' },
                { icon: Book, number: filteredPioneers.reduce((acc, p) => acc + (p.books?.length || 0), 0), label: 'مؤلف', color: '#FAC39B' },
                { icon: Award, number: filteredPioneers.reduce((acc, p) => acc + (p.achievements?.length || 0), 0), label: 'إنجاز', color: '#EB5A3C' }
              ].map((stat, index) => (
                <div key={index} className="group text-center">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transform rotate-3 group-hover:rotate-6 transition-transform duration-300"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 transform group-hover:scale-110 transition-transform duration-300"
                      style={{ color: stat.color }}
                    />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <p className="text-xs sm:text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        {/* Results Info */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <p className="text-gray-400">
              {filteredPioneers.length === 0
                ? 'لم يتم العثور على نتائج'
                : `تم العثور على ${filteredPioneers.length} ${filteredPioneers.length === 1 ? 'رائد' : 'رواد'}`}
            </p>
          </motion.div>
        )}

        {/* All Pioneers Grid */}
        {filteredPioneers.length > 0 && (
          <motion.div
            ref={pioneersRef}
            className="mb-12 sm:mb-16 lg:mb-20"
            initial="hidden"
            animate={pioneersInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">معرض الرواد</h2>
              <p className="text-base sm:text-lg lg:text-xl text-[#FAC39B] max-w-2xl mx-auto px-4">
                استكشف سير وإنجازات رواد التراث السعودي
              </p>
            </motion.div>

            {/* Pioneers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {filteredPioneers.map((pioneer, index) => (
                <motion.div
                  key={pioneer.id}
                  variants={cardVariant}
                  className="group"
                >
                  <div className="h-full bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-[#FAC39B]/10 relative overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPioneer(pioneer)}
                  >
                    {/* Background Elements */}
                    <div
                      className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transform translate-x-16 sm:translate-x-20 -translate-y-16 sm:-translate-y-20 transition-all duration-700"
                      style={{ backgroundColor: index % 3 === 0 ? '#FF9619' : index % 3 === 1 ? '#FAC39B' : '#EB5A3C' }}
                    />

                    <div className="relative">
                      {/* Pioneer Header with Image */}
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
                        {/* Image */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
                            <div
                              className="absolute inset-0 rounded-2xl sm:rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"
                              style={{
                                background: `linear-gradient(135deg, ${index % 3 === 0 ? '#FF9619' : index % 3 === 1 ? '#FAC39B' : '#EB5A3C'}, #EB5A3C)`
                              }}
                            />
                            <img
                              src={pioneer.image_url}
                              alt={pioneer.name}
                              className="relative w-full h-full object-cover rounded-2xl sm:rounded-3xl shadow-2xl"
                            />
                            <div
                              className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg"
                              style={{ backgroundColor: index % 3 === 0 ? '#FF9619' : index % 3 === 1 ? '#FAC39B' : '#EB5A3C' }}
                            >
                              <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Name and Title */}
                        <div className="flex-grow text-center sm:text-right">
                          {renderPioneerName(pioneer)}
                          <p className="text-[#FAC39B] text-lg sm:text-xl mb-2">{pioneer.title}</p>
                          <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-sm sm:text-base">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>{pioneer.years}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="relative mb-4 sm:mb-6">
                        <div className="absolute -top-2 -right-2 text-[#FAC39B]/20">
                          <Quote className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10">
                          <h4 className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl font-semibold text-white mb-3">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#FAC39B]" />
                            نبذة عن حياته
                          </h4>
                          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{pioneer.bio}</p>
                        </div>
                      </div>

                      {/* Achievements and Books Grid */}
                      <div className="grid grid-cols-1 gap-4 sm:gap-5">
                        {/* Achievements */}
                        <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-[#FF9619]/30 transition-all duration-300">
                          <h4 className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4">
                            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF9619]" />
                            أبرز إنجازاته
                            <span className="bg-[#FF9619]/20 text-[#FF9619] px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
                              {pioneer.achievements?.length || 0}
                            </span>
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            {pioneer.achievements?.map((achievement: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 sm:gap-3 group/item">
                                <div className="w-2 h-2 mt-1.5 sm:mt-2 rounded-full bg-[#FF9619] flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300"></div>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{achievement}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Books */}
                        <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-[#EB5A3C]/30 transition-all duration-300">
                          <h4 className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4">
                            <Book className="w-5 h-5 sm:w-6 sm:h-6 text-[#EB5A3C]" />
                            أهم مؤلفاته
                            <span className="bg-[#EB5A3C]/20 text-[#FAC39B] px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
                              {pioneer.books?.length || 0}
                            </span>
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            {pioneer.books?.map((book: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 sm:gap-3 group/item">
                                <div className="w-2 h-2 mt-1.5 sm:mt-2 rounded-full bg-[#EB5A3C] flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300"></div>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{book}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Legacy Section */}
        <motion.div
          className="mb-12 sm:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="relative bg-gradient-to-br from-[#EB5A3C]/20 to-[#FF9619]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/10 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="grid grid-cols-8 gap-4 h-full">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className="border border-[#FAC39B] rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
            </div>

            <div className="relative text-center">
              <div className="inline-block mb-6 sm:mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FAC39B] opacity-20 rounded-full blur-3xl animate-pulse" />
                  <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-[#FAC39B] animate-float" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">إرث خالد</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
                هؤلاء الرواد تركوا بصمة لا تُمحى في تاريخ المملكة العربية السعودية، وساهموا في حفظ تراثنا وثقافتنا للأجيال القادمة.
                إن جهودهم في التوثيق والكتابة والبحث جعلت من الممكن لنا اليوم أن نتعرف على تاريخنا العريق ونفخر بموروثنا الثقافي.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                {[
                  {
                    icon: Book,
                    title: 'التوثيق والكتابة',
                    description: 'ألفوا الكتب وسجلوا التاريخ',
                    color: '#FF9619'
                  },
                  {
                    icon: GraduationCap,
                    title: 'التعليم والتربية',
                    description: 'علموا الأجيال وربوا العقول',
                    color: '#FAC39B'
                  },
                  {
                    icon: Star,
                    title: 'الإلهام والقدوة',
                    description: 'كانوا مثالاً يُحتذى به',
                    color: '#EB5A3C'
                  }
                ].map((item, index) => (
                  <div key={index} className="group text-center">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transform rotate-3 group-hover:rotate-6 transition-transform duration-300"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 transform group-hover:scale-110 transition-transform duration-300"
                        style={{ color: item.color }}
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pioneer Detail Modal */}
        <AnimatePresence>
          {selectedPioneer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedPioneer(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-[#0F2837] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-b from-[#0F2837] to-transparent z-10 p-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl">
                      <img src={selectedPioneer.image_url} alt={selectedPioneer.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedPioneer.name}</h3>
                      <p className="text-[#FAC39B]">{selectedPioneer.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPioneer(null)}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 pt-0 space-y-6">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-[#FAC39B]" />
                      <h4 className="text-lg font-semibold text-white">الفترة الزمنية</h4>
                    </div>
                    <p className="text-gray-300">{selectedPioneer.years}</p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-[#FAC39B]" />
                      <h4 className="text-lg font-semibold text-white">نبذة عن حياته</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{selectedPioneer.bio}</p>
                  </div>

                  {selectedPioneer.achievements?.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-[#FF9619]" />
                        <h4 className="text-lg font-semibold text-white">أبرز إنجازاته</h4>
                      </div>
                      <ul className="space-y-3">
                        {selectedPioneer.achievements.map((achievement: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-2 h-2 mt-2 rounded-full bg-[#FF9619] flex-shrink-0"></div>
                            <p className="text-gray-300 leading-relaxed">{achievement}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPioneer.books?.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-[#EB5A3C]" />
                        <h4 className="text-lg font-semibold text-white">أهم مؤلفاته</h4>
                      </div>
                      <ul className="space-y-3">
                        {selectedPioneer.books.map((book: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-2 h-2 mt-2 rounded-full bg-[#EB5A3C] flex-shrink-0"></div>
                            <p className="text-gray-300 leading-relaxed">{book}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9619]/10 via-transparent to-[#EB5A3C]/10 pointer-events-none"></div>

            <div className="relative">
              <div className="inline-block mb-6 sm:mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FF9619] opacity-20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative bg-gradient-to-br from-[#FF9619] to-[#FAC39B] p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">كن جزءاً من الإرث</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
                ساهم في حفظ تراثنا وتوثيق قصص أجدادنا، وكن جزءاً من رحلة الحفاظ على الذاكرة الوطنية
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-md sm:max-w-none mx-auto px-4">
                <a
                  href="/apply"
                  className="group relative bg-gradient-to-r from-[#FF9619] to-[#FAC39B] text-[#0F2837] px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:shadow-2xl hover:shadow-[#FF9619]/30 transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAC39B] to-[#FF9619] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <Book className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>شارك قصتك</span>
                  </div>
                </a>

                <a
                  href="/ambassador"
                  className="group relative bg-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-white/20 transition-all duration-500 hover:scale-105 border border-white/20 hover:border-white/40"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span>كن سفيراً للتراث</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
