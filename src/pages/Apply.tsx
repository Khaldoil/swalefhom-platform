import { CONTACT } from '../lib/constants';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Book, Heart, Sparkles, Upload, X, Film, Image as ImageIcon, Plus, Mic, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import { useToast } from '../hooks/useToast';
import { uploadMultipleMedia } from '../lib/storage';

interface MediaFile {
  file: File;
  type: 'image' | 'video' | 'audio';
  preview?: string;
}

interface ValidationErrors {
  title?: string;
  content?: string;
  teller_name?: string;
  teller_mobile?: string;
  teller_email?: string;
}

const validateForm = (data: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.title?.trim()) {
    errors.title = 'عنوان القصة مطلوب';
  }

  if (!data.content?.trim()) {
    errors.content = 'محتوى القصة مطلوب';
  }

  if (!data.teller_name?.trim()) {
    errors.teller_name = 'الاسم مطلوب';
  }

  if (!data.teller_mobile?.trim()) {
    errors.teller_mobile = 'رقم الجوال مطلوب';
  } else if (!/^05[0-9]{8}$/.test(data.teller_mobile)) {
    errors.teller_mobile = 'رقم الجوال غير صحيح';
  }

  if (!data.teller_email?.trim()) {
    errors.teller_email = 'البريد الإلكتروني مطلوب';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.teller_email)) {
    errors.teller_email = 'البريد الإلكتروني غير صحيح';
  }

  return errors;
};

export default function Apply() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'folk_tales',
    story_type: 'real',
    format: 'written',
    teller_name: '',
    teller_mobile: '',
    teller_email: '',
    attachments: [] as File[],
  });

  const whatsappNumber = CONTACT.WHATSAPP;

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentUrls: string[] = [];
      if (formData.attachments.length > 0) {
        setIsUploading(true);
        addToast('جاري رفع المرفقات...', 'info');

        try {
          attachmentUrls = await uploadMultipleMedia(formData.attachments);
          addToast('تم رفع المرفقات بنجاح', 'success');
        } catch (error) {
          console.error('Error uploading attachments:', error);
          addToast('حدث خطأ أثناء رفع المرفقات', 'error');
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          story_type: formData.story_type,
          format: formData.format,
          status: 'draft',
          metadata: {
            teller_name: formData.teller_name,
            teller_mobile: formData.teller_mobile,
            teller_email: formData.teller_email,
            attachments: attachmentUrls
          }
        })
        .select()
        .single();

      if (storyError) throw storyError;

      addToast('تم إرسال القصة بنجاح', 'success');
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Error submitting story:', error);
      addToast(error.message || 'حدث خطأ أثناء إرسال القصة. الرجاء المحاولة مرة أخرى.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const currentCount = formData.attachments.length;

    if (currentCount + files.length > 5) {
      addToast('يمكنك رفع 5 ملفات كحد أقصى', 'error');
      return;
    }

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      const maxSize = isVideo ? 20 * 1024 * 1024 : isAudio ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

      if (!isImage && !isVideo && !isAudio) {
        addToast('يرجى رفع ملفات صور أو فيديو أو صوت فقط', 'error');
        return false;
      }

      if (file.size > maxSize) {
        addToast(
          isVideo 
            ? 'حجم الفيديو يجب ألا يتجاوز 20 ميجابايت'
            : isAudio
            ? 'حجم الملف الصوتي يجب ألا يتجاوز 10 ميجابايت'
            : 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت',
          'error'
        );
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`مرحباً، أرغب في مشاركة قصة بعنوان: ${formData.title || "قصة جديدة"}`);
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${text}`, '_blank');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="relative inline-block mb-12">
              <div className="absolute inset-0 bg-[#FAC39B] opacity-20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative">
                <Book className="w-24 h-24 text-[#FAC39B] animate-float" />
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
                حفظت قصة من النسيان
              </h1>
              <p className="text-xl text-[#FAC39B] mb-6">
                شكراً لمساهمتك في حفظ تراثنا
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                في كل قصة نرويها، نمد جسراً بين الماضي والمستقبل
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
            <h1 className="text-4xl font-bold text-white mb-6">شارك قصتك</h1>
            <p className="text-xl text-[#FAC39B]">ساهم في حفظ تراثنا من خلال توثيق قصص أجدادنا</p>
          </div>

          {/* WhatsApp Option */}
          <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-green-500/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="flex-grow text-center md:text-right">
                <h2 className="text-xl font-bold text-white mb-2">أرسل قصتك عبر الواتساب</h2>
                <p className="text-gray-300 mb-4">
                  يمكنك إرسال قصتك مباشرة عبر الواتساب مع إمكانية إرفاق الصور والفيديوهات والتسجيلات الصوتية
                </p>
                <Button 
                  onClick={handleWhatsAppShare}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageSquare className="w-5 h-5 ml-2" />
                  أرسل عبر الواتساب
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-400">أو</p>
            <h2 className="text-2xl font-bold text-white mt-2">أكمل التعبئة عبر الموقع</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16">
            {step === 1 ? (
              <div className="space-y-6">
                <Input
                  label="عنوان القصة"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="أدخل عنواناً معبراً عن القصة"
                  error={errors.title}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    محتوى القصة
                  </label>
                  <div className="bg-[#91B9B4]/10 text-[#FAC39B] px-4 py-3 rounded-lg mb-4 text-sm">
                    <p>ملاحظة مهمة: نرجو كتابة القصة كما رُويت تماماً، مع الحفاظ على الألفاظ والمصطلحات المستخدمة كما هي.</p>
                  </div>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    className={`w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] min-h-[200px] hover:bg-white/15 transition-colors ${
                      errors.content ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="اكتب القصة بالتفصيل..."
                    required
                  />
                  {errors.content && (
                    <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    المرفقات (اختياري)
                  </label>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                    <div className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                      isUploading
                        ? 'border-[#FAC39B] bg-[#FAC39B]/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}>
                      <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        multiple
                        className="hidden"
                        id="attachments"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="attachments"
                        className={`cursor-pointer block ${isUploading ? 'pointer-events-none' : ''}`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-[#FAC39B] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#FAC39B]">جاري رفع الملفات...</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-center gap-4 mb-4">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                              <Film className="w-8 h-8 text-gray-400" />
                              <Mic className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-400 mb-2">اضغط هنا أو اسحب الملفات لرفعها</p>
                            <p className="text-gray-500 text-sm">صور (حتى 5 ميجابايت) أو فيديو (حتى 20 ميجابايت) أو صوت (حتى 10 ميجابايت)</p>
                          </>
                        )}
                      </label>
                    </div>
                    
                    {/* Preview uploaded files */}
                    {formData.attachments.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden bg-white/5">
                              {file.type.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`مرفق ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : file.type.startsWith('video/') ? (
                                <video
                                  src={URL.createObjectURL(file)}
                                  className="w-full h-full object-cover"
                                  controls
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Mic className="w-12 h-12 text-gray-400" />
                                  <audio
                                    src={URL.createObjectURL(file)}
                                    controls
                                    className="absolute bottom-0 left-0 right-0"
                                  />
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveFile(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Upload More Button */}
                        {formData.attachments.length < 5 && (
                          <label
                            htmlFor="attachments"
                            className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
                          >
                            <div className="text-center">
                              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <span className="text-sm text-gray-400">إضافة المزيد</span>
                            </div>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  التالي
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Input
                  label="الاسم الكامل"
                  value={formData.teller_name}
                  onChange={(e) => handleChange('teller_name', e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  error={errors.teller_name}
                  required
                />

                <Input
                  label="رقم الجوال"
                  type="tel"
                  value={formData.teller_mobile}
                  onChange={(e) => handleChange('teller_mobile', e.target.value)}
                  placeholder="05xxxxxxxx"
                  error={errors.teller_mobile}
                  required
                />

                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.teller_email}
                  onChange={(e) => handleChange('teller_email', e.target.value)}
                  placeholder="example@email.com"
                  error={errors.teller_email}
                  required
                />

                <div className="flex gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting || isUploading}
                    className="flex-1"
                  >
                    السابق
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting || isUploading}
                    disabled={isSubmitting || isUploading}
                    className="flex-1"
                  >
                    <Send className="w-5 h-5 ml-2" />
                    {isUploading ? 'جاري رفع المرفقات...' : 'إرسال القصة'}
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