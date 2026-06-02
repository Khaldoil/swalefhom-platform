import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Book,
  Camera,
  Users,
  Mic,
  Upload,
  Share2,
  MessageSquare,
  BookOpen,
  Award,
  Heart,
  Shield,
  Zap,
  Target,
  Clock,
  MapPin,
  ArrowDown
} from 'lucide-react';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import Leaderboard from '../components/Leaderboard';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Storyteller {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  stories_count: number;
  region: string;
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
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

interface Stats {
  storytellersCount: number;
  storiesCount: number;
  regionsCount: number;
  ambassadorsCount: number;
}

export default function Home() {
  const whatsappNumber = "+966557106285";
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [stats, setStats] = useState<Stats>({
    storytellersCount: 0,
    storiesCount: 0,
    regionsCount: 13,
    ambassadorsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [aboutRef, aboutInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch storytellers
        const { data: storytellersData, error: storytellersError } = await supabase
          .from('storytellers')
          .select('*')
          .order('stories_count', { ascending: false })
          .limit(10);

        if (storytellersError) throw storytellersError;
        setStorytellers(storytellersData || []);

        // Fetch real stats
        const { data: statsData, error: statsError } = await supabase.rpc('get_home_stats');

        if (!statsError && statsData) {
          // statsData is JSON, not array
          const realStats = typeof statsData === 'object' && !Array.isArray(statsData)
            ? statsData
            : (Array.isArray(statsData) && statsData.length > 0 ? statsData[0] : null);

          if (realStats) {
            setStats({
              storytellersCount: realStats.storytellers_count || 0,
              storiesCount: realStats.published_stories_count || 0,
              regionsCount: realStats.regions_count || 13,
              ambassadorsCount: realStats.ambassadors_count || 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`السلام عليكم، أرغب في مشاركة قصة من تراثنا`);
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0F2837]">
      <SEO />

      {/* Hero Section */}
      <motion.header
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-20"
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <div className="absolute inset-0">
          <img
            src="https://mniebznrdqvtonqweqgd.supabase.co/storage/v1/object/public/stories/yxrxs6bcnw_1737467268245.png"
            alt="Saudi Heritage Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2837]/90 via-[#0F2837]/70 to-[#0F2837]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl">
            <motion.h1
              variants={fadeInUp}
              className="text-6xl sm:text-8xl font-bold text-white mb-8"
            >
              سواليفهم
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-3xl sm:text-4xl text-[#FAC39B] mb-8 font-medium"
            >
              سواليفهم إرث، وحفظها عهد
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-12 max-w-3xl"
            >
              مرحباً بكم في منصة "سواليفهم"، المبادرة الثقافية التي تجمع بين الأجيال لتوثيق وحفظ القصص والأحداث التي عاشها أجدادنا وآباؤنا في المملكة العربية السعودية.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Link
                to="/apply"
                className="group bg-gradient-to-r from-[#FF9619] to-[#FAC39B] text-[#0F2837] px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <Book className="w-5 h-5" />
                <span>ابدأ رحلتك التوثيقية</span>
                <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </Link>

              <button
                onClick={handleWhatsAppShare}
                className="group bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <MessageSquare className="w-5 h-5" />
                <span>أرسل قصتك عبر الواتساب</span>
              </button>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-8 h-12 border-2 border-[#FAC39B] rounded-full flex justify-center">
            <motion.div
              className="w-2 h-4 bg-[#FAC39B] rounded-full mt-2"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.header>

      {/* Stats Section */}
      <motion.section
        ref={statsRef}
        className="py-20 bg-gradient-to-b from-[#0F2837] to-[#0A1B26]"
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: stats.storytellersCount > 0 ? `+${stats.storytellersCount}` : "0", label: "مشارك نشط", color: "#FF9619" },
              { icon: BookOpen, number: stats.storiesCount > 0 ? `+${stats.storiesCount}` : "0", label: "قصة موثقة", color: "#FAC39B" },
              { icon: MapPin, number: stats.regionsCount.toString(), label: "منطقة مغطاة", color: "#91B9B4" },
              { icon: Award, number: stats.ambassadorsCount > 0 ? `+${stats.ambassadorsCount}` : "0", label: "رائد تراث", color: "#FF9619" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center group"
              >
                <div
                  className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon
                    className="w-10 h-10"
                    style={{ color: stat.color }}
                  />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        ref={aboutRef}
        className="py-32 bg-gradient-to-b from-[#0A1B26] to-[#91B9B4]"
        initial="hidden"
        animate={aboutInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">عن المبادرة</h2>
            <p className="text-xl text-[#FAC39B] max-w-3xl mx-auto">
              نسعى لبناء جسر بين الماضي والحاضر من خلال حفظ قصص أجدادنا
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Target,
                title: 'رؤيتنا',
                content: 'أن نكون مرجعاً وطنياً لحفظ القصص التراثية السعودية التي تلهم الأجيال وتحافظ على هويتنا الوطنية.',
                color: '#FF9619'
              },
              {
                icon: Heart,
                title: 'رسالتنا',
                content: 'تعزيز الروابط الأسرية والمجتمعية من خلال توثيق التراث الشفوي ونقله للأجيال القادمة.',
                color: '#FAC39B'
              },
              {
                icon: Shield,
                title: 'قيمنا',
                content: 'الاعتزاز بالتراث، التواصل بين الأجيال، الشفافية والمصداقية، الشمولية والتنوع',
                color: '#91B9B4'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon
                    className="w-8 h-8"
                    style={{ color: item.color }}
                  />
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-[#FAC39B] transition-colors">
                  {item.title}
                </h3>

                <p className="text-gray-300 leading-relaxed text-lg">
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Leaderboard Section */}
      <section className="py-32 bg-gradient-to-b from-[#91B9B4] to-[#0F2837]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">أبرز الرواة</h2>
            <p className="text-xl text-[#FAC39B] max-w-2xl mx-auto">
              تعرف على أكثر المشاركين نشاطاً في توثيق قصص أجدادنا
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : storytellers.length > 0 ? (
            <Leaderboard storytellers={storytellers} />
          ) : (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
              <Award className="w-16 h-16 text-[#FAC39B] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">كن أول الرواة</h3>
              <p className="text-gray-400 max-w-lg mx-auto mb-6">
                شارك قصصك وكن من أوائل المساهمين في حفظ تراثنا للأجيال القادمة
              </p>
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 bg-[#FAC39B] text-[#0F2837] px-6 py-3 rounded-lg hover:bg-[#FF9619] transition-all"
              >
                <Mic className="w-5 h-5" />
                شارك قصتك الآن
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-32 bg-[#0F2837]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-8">رحلة المشاركة</h2>
            <p className="text-2xl text-[#FAC39B] max-w-3xl mx-auto">
              ثلاث خطوات بسيطة للمساهمة في حفظ تراثنا وتوثيق قصص أجدادنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                icon: Mic,
                title: 'استمع وسجل',
                content: 'تحدث مع كبار السن في عائلتك، وثّق قصصهم وتجاربهم صوتيًا أو بالفيديو، ثم اكتب القصة.',
                color: '#FF9619',
                step: '01'
              },
              {
                icon: Upload,
                title: 'أرسل قصتك',
                content: 'قم بمشاركة الروايات التي جمعتها من خلال منصتنا الإلكترونية. يمكنك أيضًا تحميل الصور أو الوثائق التي تدعم القصة.',
                color: '#91B9B4',
                step: '02'
              },
              {
                icon: Share2,
                title: 'كن سفيرًا',
                content: 'شارك المبادرة مع أصدقائك وأقاربك، وشجعهم على التفاعل مع كبار السن وتوثيق قصصهم.',
                color: '#FAC39B',
                step: '03'
              }
            ].map((step, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="absolute -top-6 right-6 z-10">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.step}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
                    style={{ backgroundColor: `${step.color}20` }}
                  >
                    <step.icon
                      className="w-10 h-10"
                      style={{ color: step.color }}
                    />
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-[#FAC39B] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {step.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Section */}
      <section className="py-20 bg-gradient-to-b from-[#0F2837] to-[#0A1B26]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-3xl p-12 border border-green-500/20 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-green-600 to-green-500 w-28 h-28 rounded-full flex items-center justify-center shadow-2xl">
                  <MessageSquare className="w-14 h-14 text-white" />
                </div>
              </div>

              <div className="flex-grow text-center md:text-right">
                <h2 className="text-4xl font-bold text-white mb-6">
                  أرسل قصتك مباشرة عبر الواتساب
                </h2>
                <p className="text-gray-300 text-xl mb-8">
                  يمكنك الآن مشاركة قصص أجدادك بسهولة عبر الواتساب. أرسل النصوص والصور والتسجيلات الصوتية مباشرة إلى فريقنا.
                </p>
                <button
                  onClick={handleWhatsAppShare}
                  className="group bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6" />
                    <span>تواصل معنا عبر الواتساب</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-[#0A1B26] to-[#0F2837]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-8">ما يميزنا</h2>
            <p className="text-2xl text-[#FAC39B] max-w-3xl mx-auto">
              نسعى لتقديم تجربة فريدة في توثيق وحفظ التراث الشفهي السعودي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                icon: Mic,
                title: 'توثيق متعدد الوسائط',
                description: 'نوفر إمكانية توثيق القصص بالنص والصوت والفيديو، مما يضمن حفظ التراث بأصالته',
                color: '#FF9619'
              },
              {
                icon: MapPin,
                title: 'تنوع جغرافي',
                description: 'نجمع قصصاً من مختلف مناطق المملكة، مما يعكس التنوع الثقافي الغني للمجتمع السعودي',
                color: '#FAC39B'
              },
              {
                icon: Shield,
                title: 'توثيق موثوق',
                description: 'نتبع منهجية علمية في توثيق القصص والتحقق من مصادرها ومصداقيتها',
                color: '#91B9B4'
              },
              {
                icon: Zap,
                title: 'سهولة المشاركة',
                description: 'نوفر طرقاً متعددة وسهلة للمشاركة، سواء عبر الموقع أو تطبيق الواتساب',
                color: '#FF9619'
              },
              {
                icon: Users,
                title: 'مجتمع متفاعل',
                description: 'نبني مجتمعاً من الرواة والمهتمين بالتراث للتفاعل وتبادل الخبرات',
                color: '#FAC39B'
              },
              {
                icon: Clock,
                title: 'حفظ للأجيال',
                description: 'نضمن حفظ القصص والذكريات للأجيال القادمة بطريقة رقمية آمنة ومستدامة',
                color: '#91B9B4'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon
                    className="w-8 h-8"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#FAC39B] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-32 bg-[#0F2837]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">استكشف المزيد</h2>
            <p className="text-xl text-[#FAC39B]">
              تصفح مجموعتنا من القصص والصور والمصطلحات التراثية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'القصص',
                description: 'اكتشف قصص أجدادنا من مختلف مناطق المملكة',
                link: '/stories',
                color: '#FF9619'
              },
              {
                icon: Camera,
                title: 'المعرض',
                description: 'شاهد الصور والفيديوهات التاريخية',
                link: '/gallery',
                color: '#FAC39B'
              },
              {
                icon: Book,
                title: 'مسرد الألفاظ',
                description: 'تعرف على المصطلحات التراثية ومعانيها',
                link: '/glossary',
                color: '#91B9B4'
              }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon
                    className="w-8 h-8"
                    style={{ color: item.color }}
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 text-center group-hover:text-[#FAC39B] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-center">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer showJuthoor={true} />
    </div>
  );
}
