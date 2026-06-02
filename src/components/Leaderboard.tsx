import React from 'react';
import { Trophy, Medal, Award, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface Storyteller {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  stories_count: number;
  region: string;
}

interface LeaderboardProps {
  storytellers: Storyteller[];
  period?: 'weekly' | 'monthly' | 'all-time';
}

export default function Leaderboard({ storytellers, period = 'all-time' }: LeaderboardProps) {
  const sortedStorytellers = [...storytellers].sort((a, b) => b.stories_count - a.stories_count);
  const topStorytellers = sortedStorytellers.slice(0, 10);

  const getRegionName = (region: string) => {
    const regions: Record<string, string> = {
      riyadh: 'الرياض',
      makkah: 'مكة المكرمة',
      madinah: 'المدينة المنورة',
      eastern: 'المنطقة الشرقية',
      qassim: 'القصيم',
      asir: 'عسير',
      tabuk: 'تبوك',
      hail: 'حائل',
      northern: 'الحدود الشمالية',
      jazan: 'جازان',
      najran: 'نجران',
      baha: 'الباحة',
      jawf: 'الجوف',
    };
    return regions[region] || region;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const periodText = {
    weekly: 'هذا الأسبوع',
    monthly: 'هذا الشهر',
    'all-time': 'على الإطلاق',
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">أبرز الرواة {periodText[period]}</h2>
        <p className="text-[#FAC39B]">الأكثر نشاطاً في توثيق قصص أجدادنا</p>
      </div>

      <div className="space-y-4">
        {topStorytellers.map((storyteller, index) => (
          <motion.div
            key={storyteller.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl ${
              index < 3 ? 'bg-white/10' : 'hover:bg-white/5'
            } transition-colors`}
          >
            <div className="flex-shrink-0 w-12 h-12">
              {storyteller.avatar_url ? (
                <img
                  src={storyteller.avatar_url}
                  alt={storyteller.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FF9619] to-[#FAC39B] flex items-center justify-center text-[#0F2837] text-xl font-bold">
                  {storyteller.name[0]}
                </div>
              )}
            </div>

            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium">{storyteller.name}</h3>
                {getRankIcon(index)}
              </div>
              {storyteller.bio && (
                <p className="text-gray-400 text-sm line-clamp-1">{storyteller.bio}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{getRegionName(storyteller.region)}</span>
              </div>
              <div className="text-right">
                <div className="text-[#FAC39B] font-bold">{storyteller.stories_count}</div>
                <div className="text-xs text-gray-400">قصة</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {topStorytellers.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-[#FAC39B] mx-auto mb-4" />
          <p className="text-gray-400">لا يوجد رواة نشطين حالياً</p>
        </div>
      )}
    </div>
  );
}