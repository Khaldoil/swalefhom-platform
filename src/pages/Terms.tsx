import React from 'react';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, Users } from 'lucide-react';
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

export default function Terms() {
  const sections = [
    {
      icon: FileText,
      title: 'قبول الشروط',
      content: [
        'باستخدامك لمنصة سواليفهم، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام المنصة.',
        '',
        'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية، واستمرارك في استخدام المنصة يعني قبولك للشروط المحدثة.'
      ]
    },
    {
      icon: Users,
      title: 'استخدام المنصة',
      content: [
        'يمكنك استخدام منصة سواليفهم للأغراض التالية:',
        '• مشاركة القصص والروايات التراثية',
        '• الاطلاع على المحتوى المنشور',
        '• التواصل مع المجتمع',
        '• المشاركة في الفعاليات والأنشطة',
        '',
        'يجب عليك:',
        '• تقديم معلومات دقيقة وصحيحة',
        '• الحفاظ على سرية حسابك وكلمة المرور',
        '• إخطارنا فوراً بأي استخدام غير مصرح به لحسابك',
        '• احترام خصوصية وحقوق الآخرين',
        '• الالتزام بالقوانين المحلية والدولية'
      ]
    },
    {
      icon: CheckCircle,
      title: 'المحتوى المسموح',
      content: [
        'نرحب بالمحتوى الذي:',
        '• يحافظ على التراث الثقافي السعودي',
        '• يحترم القيم والتقاليد',
        '• يتسم بالأصالة والصدق',
        '• يساهم في نقل المعرفة للأجيال القادمة',
        '• يحترم حقوق الملكية الفكرية',
        '',
        'أنواع المحتوى المرحب به:',
        '• القصص الشعبية والحكايات التراثية',
        '• الأهازيج والأناشيد التقليدية',
        '• الحرف والممارسات التراثية',
        '• الوثائق والصور التاريخية',
        '• المقالات البحثية عن التراث'
      ]
    },
    {
      icon: XCircle,
      title: 'المحتوى المحظور',
      content: [
        'يُمنع منعاً باتاً نشر أي محتوى:',
        '• يخالف الشريعة الإسلامية أو القيم الأخلاقية',
        '• يحتوي على عنف أو كراهية أو تمييز',
        '• ينتهك خصوصية الآخرين',
        '• يحتوي على معلومات كاذبة أو مضللة',
        '• ينتهك حقوق الملكية الفكرية',
        '• يروج لأنشطة غير قانونية',
        '• يحتوي على محتوى جنسي أو فاحش',
        '• يسيء إلى الأشخاص أو المؤسسات',
        '',
        'نحتفظ بالحق في:',
        '• حذف أي محتوى مخالف فوراً',
        '• تعليق أو إلغاء حسابات المخالفين',
        '• اتخاذ الإجراءات القانونية عند الضرورة'
      ]
    },
    {
      icon: Scale,
      title: 'حقوق الملكية الفكرية',
      content: [
        'ملكية المحتوى الذي تنشره:',
        '• تحتفظ بجميع حقوق ملكيتك للمحتوى',
        '• تمنحنا ترخيصاً غير حصري لاستخدام المحتوى',
        '• يمكننا عرض ونشر وتوزيع المحتوى على المنصة',
        '• نلتزم بعدم استخدام المحتوى لأغراض تجارية دون إذنك',
        '',
        'ملكية المنصة:',
        '• جميع حقوق المنصة والتصميم والشعار محفوظة',
        '• لا يجوز نسخ أو تعديل أي جزء من المنصة دون إذن',
        '• العلامات التجارية والشعارات ملك لنا',
        '',
        'احترام حقوق الآخرين:',
        '• تأكد من امتلاكك الحق في نشر المحتوى',
        '• احصل على إذن من أصحاب الحقوق عند الضرورة',
        '• نسب المحتوى لأصحابه الأصليين'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'إخلاء المسؤولية',
      content: [
        'دقة المحتوى:',
        '• المحتوى المنشور يمثل آراء المستخدمين فقط',
        '• لا نضمن دقة أو اكتمال المعلومات',
        '• لا نتحمل مسؤولية أي أخطاء في المحتوى',
        '',
        'توفر الخدمة:',
        '• نسعى لتوفير الخدمة بشكل مستمر',
        '• قد تحدث انقطاعات للصيانة أو التحديثات',
        '• لا نضمن عدم وجود أخطاء أو فيروسات',
        '',
        'القرارات الإدارية:',
        '• نحتفظ بالحق في تعديل أو إيقاف أي جزء من الخدمة',
        '• قد نرفض أو نحذف أي محتوى دون إبداء أسباب',
        '• القرارات النهائية بشأن المحتوى تعود لإدارة المنصة'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F2837]">
      <SEO
        title="شروط الاستخدام | سواليفهم"
        description="اطلع على شروط وأحكام استخدام منصة سواليفهم. معلومات مهمة حول حقوقك ومسؤولياتك عند استخدام المنصة."
      />

      {/* Hero Section */}
      <motion.section
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 border-2 border-[#FAC39B] rounded-full"></div>
          <div className="absolute bottom-40 right-40 w-80 h-80 border border-[#FF9619] rounded-full"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF9619]/20 to-[#FAC39B]/20 mb-6">
              <Scale className="w-12 h-12 text-[#FF9619]" />
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl font-bold text-white mb-6"
          >
            شروط الاستخدام
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة سواليفهم. استخدامك للمنصة يعني موافقتك على هذه الشروط.
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

          {/* Final Notice */}
          <motion.div
            variants={fadeInUp}
            className="bg-gradient-to-br from-[#FF9619]/10 to-[#FAC39B]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#FF9619]/30 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              الالتزام بالشروط
            </h2>
            <p className="text-gray-300 leading-relaxed">
              باستخدامك لمنصة سواليفهم، فإنك تؤكد أنك قد قرأت وفهمت ووافقت على الالتزام بهذه الشروط والأحكام.
              نشكرك على كونك جزءاً من مجتمعنا في الحفاظ على التراث الثقافي السعودي.
            </p>
          </motion.div>

          {/* Contact Box */}
          <motion.div
            variants={fadeInUp}
            className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-3">
              هل لديك استفسارات حول الشروط؟
            </h3>
            <p className="text-gray-300 mb-4">
              فريقنا جاهز للإجابة على أي أسئلة لديك
            </p>
            <a
              href="mailto:support@swalefhom.com"
              className="text-[#FAC39B] hover:text-[#FF9619] transition-colors font-bold"
            >
              support@swalefhom.com
            </a>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
