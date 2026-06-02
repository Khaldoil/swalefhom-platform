import React from 'react';
import { Shield, Lock, Eye, UserCheck, Database, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Footer from '../components/Footer';

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

export default function Privacy() {
  const sections = [
    {
      icon: Database,
      title: 'جمع المعلومات',
      content: [
        'نقوم بجمع المعلومات التي تقدمها لنا طوعاً عند:',
        '• تسجيل حساب جديد في المنصة',
        '• مشاركة قصة أو محتوى تراثي',
        '• التقديم لبرنامج السفراء',
        '• التواصل معنا عبر نماذج الاتصال',
        '',
        'المعلومات التي قد نجمعها تشمل:',
        '• الاسم الكامل',
        '• عنوان البريد الإلكتروني',
        '• رقم الجوال',
        '• المدينة والمنطقة',
        '• العمر (اختياري)',
        '• المحتوى الذي تشاركه (قصص، صور، تسجيلات صوتية)'
      ]
    },
    {
      icon: Lock,
      title: 'استخدام المعلومات',
      content: [
        'نستخدم المعلومات التي نجمعها للأغراض التالية:',
        '• توفير وتحسين خدماتنا',
        '• التواصل معك بخصوص حسابك والمحتوى الذي تشاركه',
        '• إرسال إشعارات حول التحديثات والفعاليات',
        '• حماية المنصة من الاستخدام غير المشروع',
        '• الامتثال للالتزامات القانونية',
        '• تحليل استخدام المنصة لتحسين تجربة المستخدم',
        '',
        'لن نستخدم معلوماتك لأي أغراض تجارية أو نشاركها مع أطراف ثالثة للتسويق دون موافقتك الصريحة.'
      ]
    },
    {
      icon: UserCheck,
      title: 'مشاركة المعلومات',
      content: [
        'نحن نحترم خصوصيتك ولا نشارك معلوماتك الشخصية إلا في الحالات التالية:',
        '',
        'بموافقتك:',
        '• عند نشر قصة باسمك الصريح (إذا اخترت ذلك)',
        '• عند المشاركة في فعاليات عامة كسفير للمنصة',
        '',
        'لمقدمي الخدمات:',
        '• شركات الاستضافة وتخزين البيانات',
        '• خدمات البريد الإلكتروني والإشعارات',
        '• جميع مقدمي الخدمات ملتزمون بحماية بياناتك',
        '',
        'للامتثال القانوني:',
        '• عند الطلب من جهات حكومية مختصة',
        '• لحماية حقوقنا القانونية',
        '• في حالات الطوارئ لحماية السلامة العامة'
      ]
    },
    {
      icon: Shield,
      title: 'حماية المعلومات',
      content: [
        'نتخذ إجراءات أمنية صارمة لحماية معلوماتك:',
        '• تشفير البيانات أثناء النقل (SSL/TLS)',
        '• تخزين آمن في خوادم محمية',
        '• صلاحيات وصول محدودة للموظفين',
        '• مراقبة مستمرة للأنظمة',
        '• نسخ احتياطي منتظم للبيانات',
        '• مراجعات أمنية دورية',
        '',
        'على الرغم من اتخاذنا كل الاحتياطات، لا يمكننا ضمان الأمان المطلق على الإنترنت. نوصي بحماية كلمة المرور الخاصة بك وعدم مشاركتها مع أحد.'
      ]
    },
    {
      icon: Eye,
      title: 'حقوقك',
      content: [
        'لديك الحق في:',
        '• الوصول إلى معلوماتك الشخصية',
        '• تصحيح أي معلومات غير دقيقة',
        '• طلب حذف حسابك وبياناتك',
        '• سحب موافقتك على استخدام بياناتك',
        '• تحميل نسخة من بياناتك',
        '• الاعتراض على معالجة بياناتك',
        '',
        'لممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر:',
        'البريد الإلكتروني: privacy@swalefhom.com'
      ]
    },
    {
      icon: Mail,
      title: 'ملفات تعريف الارتباط (Cookies)',
      content: [
        'نستخدم ملفات تعريف الارتباط لتحسين تجربتك:',
        '',
        'ملفات ضرورية:',
        '• لتسجيل الدخول والحفاظ على جلستك',
        '• لتذكر تفضيلاتك واللغة',
        '',
        'ملفات تحليلية:',
        '• لفهم كيفية استخدام المنصة',
        '• لتحسين الأداء والخدمات',
        '',
        'يمكنك التحكم في ملفات تعريف الارتباط من إعدادات المتصفح. إيقاف بعض الملفات قد يؤثر على وظائف المنصة.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F2837]">
      <SEO
        title="سياسة الخصوصية | سواليفهم"
        description="تعرف على كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية في منصة سواليفهم. نحن ملتزمون بحماية خصوصيتك وأمان بياناتك."
      />

      {/* Hero Section */}
      <motion.section
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 border-2 border-[#FAC39B] rounded-full"></div>
          <div className="absolute bottom-40 left-40 w-80 h-80 border border-[#FF9619] rounded-full"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF9619]/20 to-[#FAC39B]/20 mb-6">
              <Shield className="w-12 h-12 text-[#FF9619]" />
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl font-bold text-white mb-6"
          >
            سياسة الخصوصية
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            نحن في سواليفهم نقدّر خصوصيتك ونلتزم بحماية معلوماتك الشخصية. هذه السياسة توضح كيفية جمعنا واستخدامنا وحمايتنا لبياناتك.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-8 p-4 bg-[#FAC39B]/10 border border-[#FAC39B]/30 rounded-2xl inline-block"
          >
            <p className="text-[#FAC39B] text-sm">
              آخر تحديث: 4 أكتوبر 2025
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Content Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto space-y-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF9619]/20 to-[#FAC39B]/20 flex items-center justify-center">
                    <section.icon className="w-8 h-8 text-[#FF9619]" />
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {section.title}
                  </h2>

                  <div className="space-y-2 text-gray-300 leading-relaxed">
                    {section.content.map((line, i) => (
                      <p key={i} className={line === '' ? 'h-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            variants={fadeInUp}
            className="bg-gradient-to-br from-[#FF9619]/10 to-[#FAC39B]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#FF9619]/30 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              هل لديك أسئلة حول خصوصيتك؟
            </h2>
            <p className="text-gray-300 mb-6">
              نحن هنا للإجابة على أي استفسارات لديك حول سياسة الخصوصية وحماية بياناتك
            </p>
            <a
              href="mailto:privacy@swalefhom.com"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF9619] to-[#FAC39B] text-[#0F2837] px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-[#FF9619]/30 transition-all duration-500 hover:scale-105"
            >
              <Mail className="w-6 h-6" />
              <span>تواصل معنا</span>
            </a>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
