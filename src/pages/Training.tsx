import React from 'react';
import { Users } from 'lucide-react';
import Footer from '../components/Footer';

export default function Training() {
  return (
    <div className="min-h-screen bg-[#0F2837] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Users className="w-24 h-24 text-[#FAC39B] mb-8" />
          <h1 className="text-4xl font-bold text-white mb-6">تدريب الموثقين</h1>
          <p className="text-xl text-[#FAC39B] mb-4">قريباً...</p>
          <p className="text-gray-400 text-center max-w-lg">
            نعمل على تطوير برامج تدريبية متخصصة في توثيق التراث الشفهي. ترقبوا إطلاق هذا القسم قريباً.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}