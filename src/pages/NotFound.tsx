import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, MapPin, Compass, Scroll, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      delayChildren: 0.3
    }
  }
};

export default function NotFound() {
  const [currentQuote, setCurrentQuote] = useState(0);

  const heritageQuotes = [
    "كل قصة ضائعة هي جزء من تراثنا يختفي",
    "الطريق للماضي واضح، لكن هذه الصفحة تاهت في الزمن",
    "في رحلة البحث عن الذكريات، أحياناً نضل الطريق",
    "حتى أجدادنا كانوا يضلون الطريق أحياناً، لكنهم دائماً يجدون العودة"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % heritageQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const quickLinks = [
    {
      path: '/',
      label: 'الصفحة الرئيسية',
      icon: Home,
      color: '#FF9619',
      description: 'ابدأ من البداية'
    },
    {
      path: '/stories',
      label: 'القصص',
      icon: BookOpen,
      color: '#FAC39B',
      description: 'استمع لقصص أجدادنا'
    },
    {
      path: '/pioneers',
      label: 'رواد التراث',
      icon: MapPin,
      color: '#EB5A3C',
      description: 'تعرف على الرواة'
    },
    {
      path: '/glossary',
      label: 'مسرد الألفاظ',
      icon: Scroll,
      color: '#FF9619',
      description: 'اكتشف الكلمات القديمة'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F2837] relative overflow-hidden pt-20">
      <SEO
        title="404 - ضاعت القصة | سواليفهم"
        description="يبدو أن هذه الصفحة ضاعت في صفحات التاريخ. دعنا نساعدك على إيجاد طريقك للعودة إلى قصص وتراث المملكة."
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 border-2 border-[#FAC39B] rounded-full"></div>
        <div className="absolute bottom-40 left-40 w-80 h-80 border border-[#FF9619] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#EB5A3C] rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Main Illustration Area */}
          <motion.div variants={fadeInUp} className="relative mb-12">
            <div className="relative inline-block">
              {/* Decorative circle behind */}
              <motion.div
                className="absolute inset-0 -z-10"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full border-4 border-dashed border-[#FAC39B]/20 rounded-full"></div>
              </motion.div>

              {/* Main compass icon */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Compass className="w-48 h-48 text-[#FAC39B] mx-auto drop-shadow-2xl" />
              </motion.div>

              {/* Sparkles around */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${50 + 40 * Math.cos((i * Math.PI * 2) / 6)}%`,
                    left: `${50 + 40 * Math.sin((i * Math.PI * 2) / 6)}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#FF9619]" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 404 styled as Arabic calligraphy inspiration */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h1 className="text-7xl sm:text-9xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#FF9619] via-[#FAC39B] to-[#EB5A3C] bg-clip-text text-transparent">
                ٤٠٤
              </span>
            </h1>
          </motion.div>

          {/* Main message */}
          <motion.div variants={fadeInUp} className="mb-12 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              يبدو أن هذه القصة
              <br />
              <span className="text-[#FAC39B]">ضاعت في صفحات الزمن</span>
            </h2>

            {/* Animated quotes */}
            <div className="relative h-20 mb-8">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuote}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl text-gray-300 absolute inset-0 flex items-center justify-center px-4 italic"
                >
                  "{heritageQuotes[currentQuote]}"
                </motion.p>
              </AnimatePresence>
            </div>

            <p className="text-lg text-gray-400">
              لكن لا تقلق، دعنا نساعدك على إيجاد طريقك للعودة إلى كنوز تراثنا
            </p>
          </motion.div>

          {/* Navigation Cards */}
          <motion.div variants={fadeInUp} className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.path}
                    className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 block overflow-hidden h-full"
                  >
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${link.color}15, transparent 70%)`
                      }}
                    />

                    <div className="relative">
                      {/* Icon */}
                      <motion.div
                        className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-6 transition-transform duration-300"
                        style={{ backgroundColor: `${link.color}20` }}
                        whileHover={{ rotate: 12 }}
                      >
                        <link.icon
                          className="w-10 h-10 transform group-hover:scale-110 transition-transform duration-300"
                          style={{ color: link.color }}
                        />
                      </motion.div>

                      {/* Text */}
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#FAC39B] transition-colors duration-300">
                        {link.label}
                      </h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {link.description}
                      </p>

                      {/* Arrow indicator */}
                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight
                          className="w-5 h-5 transform rotate-180"
                          style={{ color: link.color }}
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={fadeInUp}>
            <Link
              to="/"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#FF9619] to-[#FAC39B] text-[#0F2837] px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl hover:shadow-[#FF9619]/30 transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAC39B] to-[#FF9619] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center gap-3">
                <Home className="w-6 h-6" />
                <span>عودة إلى الديار</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Footer quote */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 text-center"
          >
            <p className="text-gray-500 italic text-lg">
              "كل طريق يبدأ بخطوة، وكل قصة تبدأ من الصفحة الأولى"
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-[#FAC39B]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-[#FF9619]/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 right-20 w-24 h-24 bg-[#EB5A3C]/5 rounded-full blur-2xl"></div>
    </div>
  );
}
