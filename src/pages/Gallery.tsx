import React, { useState, useEffect } from 'react';
import { Camera, Search, Film, Image as ImageIcon, Play, X, Calendar, Star } from 'lucide-react';
import Footer from '../components/Footer';
import { getGalleryItems, incrementAnalytics } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import GalleryView from '../components/GalleryView';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { trackContentView } from '../hooks/useAnalytics';

interface GalleryItem {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  title: string;
  description?: string;
  status: 'published' | 'draft';
  copyright?: string;
  created_at: string;
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

export default function Gallery() {
  const [media, setMedia] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'images' | 'videos'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const data = await getGalleryItems();
      setMedia(data?.filter(item => item.status === 'published') || []);
    } catch (err) {
      console.error('Error loading media:', err);
      setError('حدث خطأ أثناء تحميل الوسائط');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaClick = async (item: GalleryItem) => {
    setSelectedItem(item);
    await incrementAnalytics('media_view', item.id);
    // Track with new analytics
    await trackContentView('gallery', item.id, item.media_type === 'video' ? 'watch' : 'view');
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' ||
      (selectedType === 'images' && item.media_type === 'image') ||
      (selectedType === 'videos' && item.media_type === 'video');
    return matchesSearch && matchesType;
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
              onClick={loadMedia}
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
    <div className="min-h-screen bg-[#0F2837] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          className="relative mb-16"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="text-center py-16">
            <motion.div variants={fadeInUp} className="inline-block mb-8">
              <div className="bg-gradient-to-br from-[#FF9619] to-[#FAC39B] p-6 rounded-3xl">
                <Camera className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl font-bold text-white mb-6">
              معرض الوسائط
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-2xl text-[#FAC39B] mb-12 max-w-3xl mx-auto">
              مجموعة من الصور والفيديوهات التاريخية والوثائق النادرة
            </motion.p>

            {/* Media Type Selection */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { id: 'all', name: 'الكل', icon: Camera, count: media.length },
                { id: 'images', name: 'الصور', icon: ImageIcon, count: media.filter(m => m.media_type === 'image').length },
                { id: 'videos', name: 'الفيديوهات', icon: Film, count: media.filter(m => m.media_type === 'video').length }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
                    selectedType === type.id
                      ? 'bg-[#FAC39B] text-[#0F2837] shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <type.icon className="w-6 h-6" />
                  <div className="text-right">
                    <div className="font-bold">{type.name}</div>
                    <div className="text-sm opacity-75">{type.count}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="ابحث في المعرض..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 text-white rounded-xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] hover:bg-white/15 transition-colors"
            />
            <Search className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredMedia.length > 0 ? (
          <div className="mb-16 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative break-inside-avoid mb-4 sm:mb-6 cursor-pointer"
                onClick={() => handleMediaClick(item)}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#FAC39B]/50 transition-all hover:shadow-2xl hover:scale-[1.02]">
                  {/* Media */}
                  <div className="relative">
                    {item.media_type === 'image' ? (
                      <img
                        src={item.media_url}
                        alt={item.title}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative">
                        <video
                          src={item.media_url}
                          className="w-full h-auto"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-[#FAC39B]/90 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white transform translate-x-1" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                      {item.media_type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-[#FAC39B]" />
                      ) : (
                        <Film className="w-4 h-4 text-[#FF9619]" />
                      )}
                      <span className="text-white text-xs font-medium">
                        {item.media_type === 'image' ? 'صورة' : 'فيديو'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#FAC39B] transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {item.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <Star className="w-4 h-4 text-[#FAC39B]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <Camera className="w-24 h-24 text-[#FAC39B] mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">لا توجد وسائط مطابقة</h2>
            <p className="text-gray-400 text-center max-w-lg mb-6">
              لم يتم العثور على أي وسائط تطابق معايير البحث. جرب تغيير التصفية أو البحث بكلمات مختلفة.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              className="bg-[#FAC39B] text-[#0F2837] px-6 py-3 rounded-xl hover:bg-[#FF9619] transition-colors font-medium"
            >
              مسح جميع التصفيات
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-br from-[#FF9619]/20 to-[#91B9B4]/20 rounded-3xl p-12 border border-white/10">
            <div className="inline-block mb-8">
              <div className="bg-gradient-to-br from-[#FF9619] to-[#FAC39B] p-6 rounded-3xl">
                <Camera className="w-16 h-16 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6">شارك ذكرياتك البصرية</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              هل لديك صور أو فيديوهات تاريخية تحكي قصة من تراثنا؟ شاركها معنا لتكون جزءاً من المعرض
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apply"
                className="bg-gradient-to-r from-[#FF9619] to-[#FAC39B] text-[#0F2837] px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl transition-all hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6" />
                  <span>شارك صورك</span>
                </div>
              </a>

              <a
                href="/stories"
                className="bg-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <Film className="w-6 h-6" />
                  <span>استكشف القصص</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery View Modal */}
      {selectedItem && (
        <GalleryView
          items={filteredMedia}
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <Footer />
    </div>
  );
}
