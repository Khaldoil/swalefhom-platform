import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Book,
  Sparkles,
  Coffee,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Mic,
  Target,
  Award
} from 'lucide-react';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface GuideStep {
  id: number;
  title: string;
  content: string;
  tips: string[];
  icon: React.ElementType;
  color: string;
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    title: 'اختيار الوقت المناسب وتهيئة الأجواء',
    content: 'استأذن الراوي بأدب واختر وقتاً مناسباً يكون فيه مرتاحاً ومستعداً للحديث.',
    tips: [
      'استأذن بكل احترام وأدب',
      'اختر وقتاً مناسباً كما بعد العصر',
      'هيئ مكاناً هادئاً ومريحاً'
    ],
    icon: Coffee,
    color: '#FF9619'
  },
  {
    id: 2,
    title: 'فن الإنصات والاهتمام',
    content: 'أنصت بقلبك قبل أذنيك، ولا تقاطع الراوي إلا للاستيضاح بلطف، وأظهر اهتمامك بإيماءات بسيطة.',
    tips: [
      'أظهر اهتمامك بإيماءات بسيطة',
      'لا تقاطع إلا للاستيضاح بلطف',
      'احترم رغبة الراوي في التوقف'
    ],
    icon: MessageCircle,
    color: '#91B9B4'
  },
  {
    id: 3,
    title: 'توثيق القصة بأمانة',
    content: 'سجل القصة كما رواها تماماً، واحرص على دقة التفاصيل والحفاظ على الألفاظ الأصلية.',
    tips: [
      'وثق القصة بأمانة تامة',
      'حافظ على اللهجة والألفاظ الأصلية',
      'راجع التفاصيل مع الراوي بعناية'
    ],
    icon: Mic,
    color: '#FAC39B'
  }
];

// Animation variants
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

export default function Guide() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Intersection Observer hooks
  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [stepsRef, stepsInView] = useInView({ threshold: 0.2, triggerOnce: true });

  const nextStep = () => {
    if (currentStep < guideSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);

      // Move to next step automatically if not on last step
      if (stepId < guideSteps.length) {
        setTimeout(() => {
          setCurrentStep(stepId + 1);
        }, 500); // Small delay for visual feedback
      }
    }
  };

  const currentStepData = guideSteps.find(s => s.id === currentStep)!;

  return (
    <div className="min-h-screen bg-[#0F2837] pt-20 sm:pt-24">
      {/* Enhanced Hero Section */}
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
            <motion.div variants={fadeInUp} className="inline-block mb-8 sm:mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FAC39B] opacity-30 rounded-full blur-3xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-[#FF9619] to-[#FAC39B] p-4 sm:p-6 rounded-2xl sm:rounded-3xl transform rotate-3 hover:rotate-6 transition-transform duration-500">
                  <Book className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-float" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4"
            >
              <span className="bg-gradient-to-r from-[#FF9619] via-[#FAC39B] to-[#91B9B4] bg-clip-text text-transparent">
                دليل جمع القصص
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-[#FAC39B] max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4"
            >
              ثلاث خطوات بسيطة لحفظ قصص وذكريات أجدادنا
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto px-4"
            >
              {[
                { icon: Book, number: '3', label: 'خطوات بسيطة', color: '#FF9619' },
                { icon: Users, number: '1000+', label: 'راوٍ نشط', color: '#FAC39B' },
                { icon: Award, number: '500+', label: 'قصة موثقة', color: '#91B9B4' }
              ].map((stat, index) => (
                <div key={index} className="group text-center">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 transform rotate-3 group-hover:rotate-6 transition-transform duration-300"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon
                      className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:scale-110 transition-transform duration-300"
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
        {/* Interactive Guide Steps */}
        <motion.div
          ref={stepsRef}
          className="mb-12 sm:mb-16 lg:mb-20"
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-6">خطوات التوثيق</h2>
            <p className="text-base sm:text-lg lg:text-xl text-[#FAC39B] max-w-3xl mx-auto px-4">
              اتبع هذه الخطوات البسيطة لتوثيق قصص أجدادك بطريقة احترافية
            </p>
          </motion.div>

          <div className="relative">
            {/* Mobile-Friendly Progress Indicator */}
            <div className="mb-8 sm:mb-12">
              {/* Step Indicators - Horizontal on all screens */}
              <div className="flex justify-between items-center mb-6 sm:mb-8 px-2">
                {guideSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <motion.div
                      className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center transition-all duration-500 border-2 relative ${
                        step.id <= currentStep
                          ? 'bg-gradient-to-br from-[#FF9619] to-[#FAC39B] text-white border-white shadow-lg shadow-[#FAC39B]/30'
                          : 'bg-white/10 text-white border-white/20'
                      } ${
                        step.id === currentStep
                          ? 'ring-2 ring-[#FAC39B]/50 scale-110'
                          : ''
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <span className="text-base sm:text-lg font-bold">{step.id}</span>
                      )}
                    </motion.div>

                    {/* Step Label - Hidden on mobile, visible on tablet+ */}
                    <p className={`hidden sm:block text-xs lg:text-sm font-medium mt-2 transition-colors text-center max-w-[80px] lg:max-w-none ${
                      step.id <= currentStep ? 'text-[#FAC39B]' : 'text-gray-400'
                    }`}>
                      الخطوة {step.id}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FF9619] via-[#FAC39B] to-[#91B9B4] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / guideSteps.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Progress Text - Mobile optimized */}
              <div className="text-center mt-4">
                <div className="text-lg sm:text-xl font-bold text-[#FAC39B] mb-1">
                  الخطوة {currentStep} من {guideSteps.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {Math.round((currentStep / guideSteps.length) * 100)}% مكتمل
                </div>
              </div>
            </div>

            {/* Step Content - No min-height */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 relative overflow-hidden"
            >
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent pointer-events-none" />
              <div
                className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 rounded-full blur-3xl opacity-10 transform translate-x-10 sm:translate-x-20 -translate-y-10 sm:-translate-y-20 pointer-events-none"
                style={{ backgroundColor: currentStepData.color }}
              />

              <div className="relative">
                {/* Step Header */}
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="flex-shrink-0">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transform rotate-3 shadow-xl"
                      style={{ backgroundColor: `${currentStepData.color}20`, boxShadow: `0 10px 30px ${currentStepData.color}30` }}
                    >
                      <currentStepData.icon
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        style={{ color: currentStepData.color }}
                      />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                      {currentStepData.title}
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                      {currentStepData.content}
                    </p>
                  </div>
                </div>

                {/* Tips Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {currentStepData.tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                        style={{ backgroundColor: currentStepData.color }}
                      />
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{tip}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Step Completion Button */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      markStepComplete(currentStep);
                    }}
                    className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-2 text-sm sm:text-base font-medium ${
                      completedSteps.includes(currentStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    {completedSteps.includes(currentStep) ? 'تم إكمال الخطوة' : 'أكملت هذه الخطوة'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Navigation - Mobile optimized */}
            <div className="flex items-center justify-between gap-4 mt-6 sm:mt-8">
              <button
                onClick={prevStep}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base font-medium ${
                  currentStep > 1
                    ? 'text-white hover:bg-white/10 hover:scale-105 border border-white/20 hover:border-white/40'
                    : 'text-gray-600 cursor-not-allowed opacity-50'
                }`}
                disabled={currentStep === 1}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">السابق</span>
              </button>

              <button
                onClick={nextStep}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base font-medium ${
                  currentStep < guideSteps.length
                    ? 'text-white hover:bg-white/10 hover:scale-105 border border-white/20 hover:border-white/40'
                    : 'text-gray-600 cursor-not-allowed opacity-50'
                }`}
                disabled={currentStep === guideSteps.length}
              >
                <span className="hidden sm:inline">التالي</span>
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF9619]/20 via-[#FAC39B]/20 to-[#91B9B4]/20 rounded-2xl sm:rounded-3xl blur-3xl" />
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-2 border-[#FAC39B]/30 hover:border-[#FAC39B]/50 transition-all duration-500 text-center py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-5 sm:top-10 right-5 sm:right-10 w-24 sm:w-32 h-24 sm:h-32 bg-[#FF9619]/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-20 sm:w-24 h-20 sm:h-24 bg-[#FAC39B]/10 rounded-full animate-pulse delay-1000"></div>
            </div>

            <div className="relative">
              <div className="inline-block mb-6 sm:mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FAC39B] opacity-30 rounded-full blur-3xl animate-pulse" />
                  <div className="relative bg-gradient-to-br from-[#FF9619] to-[#FAC39B] p-4 sm:p-6 rounded-2xl sm:rounded-3xl transform hover:rotate-6 transition-transform duration-500">
                    <Target className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                هل أنت مستعد لتوثيق قصص أجدادنا؟
              </h2>

              <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                ابدأ رحلتك في حفظ التراث وكن جزءاً من مجتمع الرواة الذين يحافظون على ذاكرة الوطن
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-md sm:max-w-none mx-auto">
                <Link
                  to="/apply"
                  className="group relative bg-gradient-to-r from-[#FF9619] to-[#FAC39B] text-[#0F2837] px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:shadow-2xl hover:shadow-[#FF9619]/30 transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAC39B] to-[#FF9619] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>ابدأ الآن</span>
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-180 transition-transform duration-500" />
                  </div>
                </Link>

                <Link
                  to="/stories"
                  className="group relative bg-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-white/20 transition-all duration-500 hover:scale-105 border border-white/20 hover:border-white/40"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <Book className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span>استكشف القصص</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
