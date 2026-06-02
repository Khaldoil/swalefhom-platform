import React from 'react';
import { Book, Heart, Users, Target, Star, Award } from 'lucide-react';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0F2837] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-6">عن سواليفهم</h1>
          <p className="text-xl text-[#FAC39B] max-w-3xl mx-auto">
            مبادرة ثقافية تهدف إلى توثيق وحفظ القصص والأحداث التي عاشها أجدادنا وآباؤنا في المملكة العربية السعودية
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#FF9619]/10 flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-[#FF9619]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">رؤيتنا</h2>
            <p className="text-gray-300 leading-relaxed">
              أن نكون مرجعاً وطنياً لحفظ القصص التراثية السعودية التي تلهم الأجيال وتحافظ على هويتنا الوطنية.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#91B9B4]/10 flex items-center justify-center mb-6">
              <Star className="w-6 h-6 text-[#91B9B4]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">رسالتنا</h2>
            <p className="text-gray-300 leading-relaxed">
              تعزيز الروابط الأسرية والمجتمعية من خلال توثيق التراث الشفوي ونقله للأجيال القادمة.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Book,
                title: 'الاعتزاز بالتراث',
                description: 'نؤمن بأهمية تراثنا وضرورة الحفاظ عليه وتوثيقه للأجيال القادمة'
              },
              {
                icon: Users,
                title: 'التواصل بين الأجيال',
                description: 'نسعى لتعزيز التواصل بين الأجيال من خلال مشاركة القصص والخبرات'
              },
              {
                icon: Heart,
                title: 'المصداقية والأمانة',
                description: 'نلتزم بالدقة والأمانة في توثيق القصص والحفاظ على أصالتها'
              }
            ].map((value, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF9619]/10 to-[#91B9B4]/10 flex items-center justify-center mx-auto mb-6 transform rotate-3 transition-transform group-hover:rotate-6">
                  <value.icon className="w-8 h-8 text-[#FAC39B]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="w-16 h-16 text-[#FAC39B] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6">أثرنا في المجتمع</h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              نعمل على تحقيق أثر إيجابي في مجتمعنا من خلال:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-300">✦ توثيق القصص والذكريات التاريخية</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-300">✦ تعزيز الهوية الوطنية والثقافية</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-300">✦ حفظ التراث الشفهي من الاندثار</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-300">✦ ربط الأجيال الجديدة بتاريخهم وتراثهم</p>
              </div>
            </div>
          </div>
        </div>

        {/* Join Us */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">انضم إلينا</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            نرحب بكل من يشاركنا الشغف بحفظ تراثنا وتوثيق قصص أجدادنا. يمكنك المساهمة معنا كراوٍ للقصص أو سفير للتراث.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/apply" 
              className="inline-flex items-center gap-2 bg-[#FF9619] text-[#0F2837] px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#FAC39B] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Book className="w-5 h-5" />
              شارك قصتك
            </a>
            <a 
              href="/ambassador" 
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/20 transition-all duration-300"
            >
              <Award className="w-5 h-5" />
              كن سفيراً للتراث
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}