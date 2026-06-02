import React from 'react';
import { Trophy } from 'lucide-react';
import Footer from '../components/Footer';

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-[#0F2837] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <Trophy className="w-24 h-24 text-[#FAC39B] mb-8 animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-[#EB5A3C] text-white text-sm px-3 py-1 rounded-full">
              قريباً
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">أبرز الرواة</h1>
          <p className="text-xl text-[#FAC39B] mb-4">كن جزءاً من رحلة حفظ التراث</p>
          <p className="text-gray-400 text-center max-w-lg">
            نعمل على تطوير نظام متكامل لتكريم وإبراز أكثر المشاركين نشاطاً في توثيق قصص أجدادنا. ترقبوا إطلاق هذا القسم قريباً.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}