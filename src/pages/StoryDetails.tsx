import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Book, 
  Share2, 
  Facebook, 
  Copy, 
  Check, 
  X, 
  Volume2, 
  Play, 
  Pause,
  Calendar,
  MapPin,
  Tag,
  User,
  Clock,
  Heart,
  Bookmark,
  Eye,
  Sparkles,
  Quote,
  FileText,
  Film,
  Mic,
  RotateCcw,
  SkipBack,
  SkipForward,
  Download,
  Headphones
} from 'lucide-react';
import { getStoryById, incrementAnalytics } from '../lib/supabase';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ShareModal from '../components/ShareModal';
import Button from '../components/Button';
import AnnotatedText from '../components/AnnotatedText';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useContentTracking } from '../hooks/useAnalytics';

// Animation variants
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

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function StoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  // Analytics tracking
  const { setIsCompleted } = useContentTracking(
    'story',
    id || '',
    story?.format === 'audio' ? 'listen' : 'read'
  );

  // Intersection Observer hooks
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [contentRef, contentInView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (!id) {
      navigate('/stories');
      return;
    }
    loadStory();

    return () => {
      cleanupAudio();
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [id, navigate]);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.removeEventListener('ended', handleEnded);
      audioRef.current.removeEventListener('error', handleError);
      audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
      audioRef.current.src = '';
      audioRef.current.load();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
      setAudioError(null);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = (e: Event) => {
    console.error('Audio error:', e);
    setAudioError('حدث خطأ أثناء تحميل الملف الصوتي');
    setIsLoaded(false);
    setIsPlaying(false);
  };

  const handleCanPlayThrough = () => {
    setIsLoaded(true);
    setAudioError(null);
  };

  const initializeAudio = (url: string) => {
    cleanupAudio();

    const audio = new Audio();
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    audio.preload = 'auto';
    audio.src = url;
    audio.load();
    audioRef.current = audio;
  };

  const loadStory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAudioError(null);
      const data = await getStoryById(id!);
      
      if (!data) {
        setError('القصة غير موجودة');
        return;
      }

      if (data.status !== 'published') {
        navigate('/stories');
        return;
      }

      setStory(data);
      await incrementAnalytics('story_view', data.id);

      if (data.format === 'audio' && data.media_url) {
        initializeAudio(data.media_url);
      }
    } catch (err: any) {
      console.error('Error loading story:', err);
      setError('حدث خطأ أثناء تحميل القصة');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !isLoaded || audioError) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          setAudioError(null);
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      setAudioError('حدث خطأ أثناء تشغيل الملف الصوتي');
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !isLoaded || audioError) return;
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    audioRef.current.currentTime = time;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current || !isLoaded || audioError) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlaybackRateChange = () => {
    if (!audioRef.current || !isLoaded || audioError) return;
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    audioRef.current.playbackRate = nextRate;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    if (!story?.media_url) return;
    
    setAudioError(null);
    setIsLoaded(false);
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
    }
    
    retryTimeoutRef.current = window.setTimeout(() => {
      initializeAudio(story.media_url);
    }, 500);
  };

  const handleShare = async (platform: 'x' | 'facebook' | 'whatsapp' | 'copy') => {
    if (!story) return;

    const url = window.location.href;
    const text = `${story.title} - سواليفهم`;
    const hashtags = 'سواليفهم,تراث,قصص_أجدادنا';

    switch (platform) {
      case 'x':
        window.open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'whatsapp':
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy URL:', err);
        }
        break;
    }
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'lullabies': 'أهازيج الأمهات',
      'bedtime': 'حكايات ما قبل النوم',
      'folk_tales': 'الحكايات الشعبية',
      'historical': 'قصص تاريخية',
      'traditional_games': 'الألعاب الشعبية',
      'proverbs': 'الأمثال والحكم',
      'foundation_day': 'قصص التأسيس',
      'national_day': 'ذكريات اليوم الوطني'
    };
    return categories[category] || category;
  };

  const getRegionName = (region: string) => {
    const regions: Record<string, string> = {
      riyadh: 'الرياض',
      makkah: 'مكة المكرمة',
      madinah: 'المدينة المنورة',
      eastern: 'المنطقة الشرقية',
      qassim: 'القصيم',
      asir: 'عسير',
      tabuk: 'تبوك',
      hail: 'حائل',
      northern: 'الحدود الشمالية',
      jazan: 'جازان',
      najran: 'نجران',
      baha: 'الباحة',
      jawf: 'الجوف'
    };
    return regions[region] || region;
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'audio':
        return Volume2;
      case 'video':
        return Film;
      default:
        return FileText;
    }
  };

  const getFormatName = (format: string) => {
    switch (format) {
      case 'audio':
        return 'قصة صوتية';
      case 'video':
        return 'قصة مرئية';
      default:
        return 'قصة مكتوبة';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-red-500 opacity-20 rounded-full blur-3xl animate-pulse" />
              <X className="w-24 h-24 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-6">
              {error || 'القصة غير موجودة'}
            </h1>
            <Link 
              to="/stories" 
              className="inline-flex items-center gap-2 text-[#FAC39B] hover:text-white transition-colors bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20"
            >
              <ArrowRight className="w-5 h-5" />
              العودة إلى القصص
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const _readingTime = Math.ceil(story.content.split(' ').length / 200);
  const FormatIcon = getFormatIcon(story.format);

  return (
    <div className="min-h-screen bg-[#0F2837]">
      {/* Enhanced Hero Section */}
      <motion.div 
        ref={headerRef}
        className="relative min-h-[80vh] overflow-hidden"
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        {/* Background Image with Enhanced Overlay */}
        <div className="absolute inset-0">
          {story.image_url ? (
            <img
              src={story.image_url}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0F2837] via-[#91B9B4] to-[#0F2837] flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FAC39B] opacity-20 rounded-full blur-3xl animate-pulse" />
                <FormatIcon className="w-32 h-32 text-[#FAC39B] opacity-30 animate-float" />
              </div>
            </div>
          )}
          
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2837]/60 via-[#0F2837]/40 to-[#0F2837]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2837]/20 via-transparent to-[#0F2837]/20" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          {/* Back Button */}
          <motion.div variants={fadeInUp} className="mb-8">
            <Link
              to="/stories"
              className="group inline-flex items-center gap-3 text-[#FAC39B] hover:text-white transition-all duration-300 bg-[#0F2837]/70 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:border-white/40 hover:scale-105"
            >
              <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">العودة إلى القصص</span>
            </Link>
          </motion.div>

          {/* Story Metadata Badges */}
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-8">
            <div className="bg-[#FF9619] text-[#0F2837] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
              <FormatIcon className="w-4 h-4" />
              {getFormatName(story.format)}
            </div>
            <div className="bg-[#91B9B4] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
              <Tag className="w-4 h-4" />
              {story.categories?.name || getCategoryName(story.category)}
            </div>
            <div className="bg-[#0F2837]/80 backdrop-blur-sm text-[#FAC39B] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-[#FAC39B]/30">
              <Calendar className="w-4 h-4" />
              {story.date}
            </div>
            <div className="bg-[#0F2837]/80 backdrop-blur-sm text-[#FAC39B] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-[#FAC39B]/30">
              <MapPin className="w-4 h-4" />
              {getRegionName(story.region)}
            </div>
          </motion.div>

          {/* Story Title */}
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-[#FAC39B] to-white bg-clip-text text-transparent">
              {story.title}
            </span>
          </motion.h1>

          {/* Story Excerpt */}
          {story.excerpt && (
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl"
            >
              {story.excerpt}
            </motion.p>
          )}

        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Enhanced Share Section */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 rounded-xl bg-[#FAC39B]/20 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-[#FAC39B]" />
              </div>
              <div>
                <h3 className="font-bold">شارك هذه القصة</h3>
                <p className="text-sm text-gray-400">ساهم في نشر تراثنا</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare('x')}
                className="group p-3 hover:bg-white/10 rounded-xl transition-all duration-300 text-white hover:text-[#1DA1F2] hover:scale-110"
                title="شارك على X"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="group p-3 hover:bg-white/10 rounded-xl transition-all duration-300 text-[#4267B2] hover:text-white hover:scale-110"
                title="شارك على فيسبوك"
              >
                <Facebook className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="group p-3 hover:bg-white/10 rounded-xl transition-all duration-300 text-[#25D366] hover:text-white hover:scale-110"
                title="شارك على واتساب"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="group p-3 hover:bg-white/10 rounded-xl transition-all duration-300 text-gray-400 hover:text-white hover:scale-110"
                title="انسخ الرابط"
              >
                {copied ? <Check className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="group px-6 py-3 bg-[#FAC39B] text-[#0F2837] rounded-xl hover:bg-[#FF9619] transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                أخبر صديق
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Audio Player */}
        {story.format === 'audio' && story.media_url && (
          <motion.div 
            className="bg-gradient-to-br from-[#91B9B4]/20 to-[#FF9619]/20 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scaleIn}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FAC39B]/20 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-[#FAC39B]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">مشغل الصوت</h3>
                <p className="text-gray-400 text-sm">استمع للقصة بصوت الراوي</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Main Controls */}
              <div className="flex items-center gap-6">
                {/* Play/Pause Button */}
                <button
                  onClick={audioError ? handleRetry : handlePlayPause}
                  disabled={!isLoaded && !audioError}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-2xl ${
                    audioError ? 'bg-red-500 hover:bg-red-600' :
                    isLoaded ? 'bg-gradient-to-br from-[#FF9619] to-[#FAC39B] hover:from-[#FAC39B] hover:to-[#FF9619]' : 
                    'bg-gray-500 cursor-not-allowed'
                  }`}
                  aria-label={audioError ? 'إعادة المحاولة' : isPlaying ? 'إيقاف' : 'تشغيل'}
                >
                  {audioError ? (
                    <RotateCcw className="w-10 h-10 text-white" />
                  ) : !isLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : isPlaying ? (
                    <Pause className="w-10 h-10 text-white" />
                  ) : (
                    <Play className="w-10 h-10 text-white transform translate-x-1" />
                  )}
                </button>

                {/* Secondary Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSkip(-10)}
                    disabled={!isLoaded || audioError}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                    title="الرجوع 10 ثوان"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleSkip(10)}
                    disabled={!isLoaded || audioError}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                    title="التقدم 10 ثوان"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handlePlaybackRateChange}
                    disabled={!isLoaded || audioError}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 font-medium"
                    title="تغيير سرعة التشغيل"
                  >
                    {playbackRate}x
                  </button>
                </div>
              </div>

              {/* Progress Section */}
              <div className="flex-grow">
                {audioError ? (
                  <div className="text-center py-8">
                    <div className="text-red-400 mb-4 text-lg font-medium">{audioError}</div>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 text-[#FAC39B] hover:text-[#FF9619] transition-colors font-medium"
                    >
                      <RotateCcw className="w-5 h-5" />
                      إعادة المحاولة
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="relative h-4">
                      <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF9619] via-[#FAC39B] to-[#91B9B4] transition-all duration-300 rounded-full"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        onMouseDown={handleSeekStart}
                        onMouseUp={handleSeekEnd}
                        onTouchStart={handleSeekStart}
                        onTouchEnd={handleSeekEnd}
                        disabled={!isLoaded || audioError}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        style={{ 
                          WebkitAppearance: 'none',
                          background: 'transparent' 
                        }}
                      />
                    </div>

                    {/* Time Display */}
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{formatTime(currentTime)}</span>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>المدة الإجمالية</span>
                        <span className="text-white font-medium">{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Video Player */}
        {story.format === 'video' && story.media_url && (
          <motion.div 
            className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 mb-8 border border-white/20 shadow-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scaleIn}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FAC39B]/20 flex items-center justify-center">
                <Film className="w-6 h-6 text-[#FAC39B]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">مشغل الفيديو</h3>
                <p className="text-gray-400 text-sm">شاهد القصة بالصوت والصورة</p>
              </div>
            </div>
            
            <div className="aspect-video rounded-2xl overflow-hidden bg-black/20">
              <video
                src={story.media_url}
                className="w-full h-full"
                controls
                controlsList="nodownload"
                playsInline
                poster={story.image_url}
              />
            </div>
          </motion.div>
        )}

        {/* Enhanced Story Content */}
        <motion.div 
          ref={contentRef}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-16 border border-white/20 shadow-xl relative overflow-hidden"
          initial="hidden"
          animate={contentInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAC39B]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF9619]/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            {/* Content Header */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#91B9B4]/20 flex items-center justify-center">
                <Quote className="w-6 h-6 text-[#91B9B4]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">نص القصة</h2>
                <p className="text-gray-400">كما رواها الراوي</p>
              </div>
            </motion.div>

            {/* Story Text */}
            <motion.div
              variants={fadeInUp}
              className="prose prose-lg prose-invert max-w-none"
            >
              <div className="relative space-y-8">
                <span className="absolute -right-6 -top-2 text-6xl text-[#FAC39B]/20 font-serif">
                  "
                </span>
                <AnnotatedText
                  text={story.content}
                  storyId={story.id}
                  className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap"
                />
              </div>
            </motion.div>

            {/* Story Metadata */}
            {story.metadata && (
              <motion.div 
                variants={fadeInUp}
                className="mt-12 pt-8 border-t border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-[#FAC39B]" />
                  معلومات الراوي
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {story.metadata.teller_name && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">اسم الراوي</p>
                      <p className="text-white font-medium">{story.metadata.teller_name}</p>
                    </div>
                  )}
                  {story.metadata.teller_city && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">المدينة</p>
                      <p className="text-white font-medium">{story.metadata.teller_city}</p>
                    </div>
                  )}
                  {story.metadata.story_source && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">مصدر القصة</p>
                      <p className="text-white font-medium">{story.metadata.story_source}</p>
                    </div>
                  )}
                  {story.metadata.source_age && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">عمر المصدر</p>
                      <p className="text-white font-medium">{story.metadata.source_age} سنة</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="relative bg-gradient-to-br from-[#FF9619]/20 to-[#91B9B4]/20 rounded-3xl p-12 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAC39B]/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
            
            <div className="relative">
              <div className="inline-block mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FAC39B] opacity-20 rounded-full blur-3xl animate-pulse" />
                  <Heart className="w-16 h-16 text-[#FAC39B] animate-float" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#FF9619] animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">أعجبتك القصة؟</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                شاركها مع أصدقائك وعائلتك، وساهم في نشر تراثنا الجميل
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/apply"
                  className="group relative bg-gradient-to-r from-[#FF9619] to-[#FAC39B] text-[#0F2837] px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-[#FF9619]/30 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAC39B] to-[#FF9619] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-3">
                    <Book className="w-6 h-6" />
                    <span>شارك قصتك أيضاً</span>
                  </div>
                </Link>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="group relative bg-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span>شارك مع الأصدقاء</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={story.title}
        url={window.location.href}
      />

      <Footer />
    </div>
  );
}