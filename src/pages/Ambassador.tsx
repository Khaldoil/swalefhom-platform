import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, UserCheck, Heart, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { useToast } from '../hooks/useToast';

export default function Ambassador() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    age: '',
    city: '',
    education: '',
    motivation: '',
    contribution: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ambassador_applications')
        .insert([{
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          age: formData.age ? parseInt(formData.age) : null,
          city: formData.city,
          education: formData.education,
          motivation: formData.motivation,
          contribution: formData.contribution,
          status: 'pending'
        }]);

      if (error) throw error;

      addToast('تم إرسال طلبك بنجاح. سنتواصل معك قريباً.', 'success');
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      addToast('حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.mobile || !formData.city) {
        addToast('يرجى تعبئة جميع الحقول المطلوبة', 'error');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="relative inline-block mb-12">
              <div className="absolute inset-0 bg-[#FAC39B] opacity-20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative">
                <UserCheck className="w-24 h-24 text-[#FAC39B] animate-float" />
                <div className="absolute -top-4 -right-4">
                  <Heart className="w-8 h-8 text-[#FF9619] animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Sparkles className="w-6 h-6 text-[#FAC39B] animate-pulse" />
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h1 className="text-3xl font-bold text-white mb-4">
                شكراً لك على رغبتك في الانضمام إلينا
              </h1>
              <p className="text-xl text-[#FAC39B] mb-6">
                سنراجع طلبك ونتواصل معك قريباً
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                معاً نحفظ تراثنا ونوثق قصص أجدادنا للأجيال القادمة
              </p>
            </div>

            <p className="text-sm text-gray-500 mt-8 animate-pulse">
              سيتم توجيهك للصفحة الرئيسية خلال لحظات...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0F2837]">
      <div className="flex-grow pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-6">كن سفيراً للتراث</h1>
            <p className="text-xl text-[#FAC39B]">انضم إلينا في رحلة حفظ وتوثيق تراثنا</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`h-0.5 w-full ${step === 2 ? 'bg-[#FAC39B]' : 'bg-white/10'}`} />
                </div>
                <div className="relative flex justify-between">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= 1 ? 'bg-[#FAC39B] text-[#0F2837]' : 'bg-white/10 text-white'
                  }`}>
                    1
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= 2 ? 'bg-[#FAC39B] text-[#0F2837]' : 'bg-white/10 text-white'
                  }`}>
                    2
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between">
                <span className={`text-sm ${step >= 1 ? 'text-[#FAC39B]' : 'text-gray-400'}`}>
                  المعلومات الشخصية
                </span>
                <span className={`text-sm ${step >= 2 ? 'text-[#FAC39B]' : 'text-gray-400'}`}>
                  معلومات المساهمة
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16">
            {step === 1 ? (
              <div className="space-y-6">
                <Input
                  label="الاسم الكامل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                  required
                />

                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />

                <Input
                  label="رقم الجوال"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="05xxxxxxxx"
                  required
                />

                <Input
                  label="العمر (اختياري)"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="أدخل عمرك"
                />

                <Input
                  label="المدينة"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="أدخل مدينة إقامتك"
                  required
                />

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full"
                >
                  التالي
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Select
                  label="المؤهل العلمي"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  options={[
                    { value: 'high_school', label: 'ثانوية عامة' },
                    { value: 'diploma', label: 'دبلوم' },
                    { value: 'bachelors', label: 'بكالوريوس' },
                    { value: 'masters', label: 'ماجستير' },
                    { value: 'phd', label: 'دكتوراه' }
                  ]}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ما الذي دفعك للتقديم كسفير للتراث؟
                  </label>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    كيف يمكنك المساهمة في حفظ وتوثيق التراث؟
                  </label>
                  <textarea
                    value={formData.contribution}
                    onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                    className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    السابق
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1"
                  >
                    <Send className="w-5 h-5 ml-2" />
                    إرسال الطلب
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}