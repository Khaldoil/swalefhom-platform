import React, { useState, useEffect } from 'react';
import { Search, Hash, BookOpen, Quote, Tag } from 'lucide-react';
import { getGlossaryTerms } from '../lib/supabase';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';

interface GlossaryTerm {
  id: string;
  word: string;
  definition: string;
  category: string;
  example: string;
  source?: string;
}

export default function Glossary() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const categories = [
    { id: 'daily', name: 'الحياة اليومية' },
    { id: 'trade', name: 'التجارة والأسواق' },
    { id: 'agriculture', name: 'الزراعة' },
    { id: 'weather', name: 'الطقس والمناخ' },
    { id: 'food', name: 'الطعام والشراب' },
    { id: 'clothes', name: 'الملابس والأزياء' }
  ];

  const arabicLetters = [
    'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
  ];

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setIsLoading(true);
      const data = await getGlossaryTerms();
      setTerms(data || []);
    } catch (err) {
      console.error('Error loading terms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTerms = terms.filter(term => {
    const matchesSearch = !searchQuery ||
      term.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || term.category === selectedCategory;
    const matchesLetter = !selectedLetter || term.word.startsWith(selectedLetter);
    return matchesSearch && matchesCategory && matchesLetter;
  });

  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.word[0];
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const sortedLetters = Object.keys(groupedTerms).sort((a, b) =>
    arabicLetters.indexOf(a) - arabicLetters.indexOf(b)
  );

  const termCount = filteredTerms.length;
  const categoryCount = new Set(filteredTerms.map(t => t.category)).size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F2837] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2837]">
      <SEO
        title="مسرد الألفاظ التراثية | سواليفهم"
        description="قاموس شامل للمصطلحات والألفاظ التراثية السعودية، مع التعريفات والأمثلة والمصادر. اكتشف معاني الكلمات القديمة واحفظ تراثنا اللغوي."
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF9619]/20 to-[#FAC39B]/20 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-[#FF9619]" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              مسرد الألفاظ
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              قاموس شامل للمصطلحات والألفاظ التراثية السعودية
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#FAC39B]" />
                <span className="text-gray-400">
                  <span className="font-bold text-white">{termCount}</span> مصطلح
                </span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FAC39B]" />
                <span className="text-gray-400">
                  <span className="font-bold text-white">{categoryCount}</span> تصنيف
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن مصطلح أو معنى..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FAC39B] focus:bg-white/10"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border ${
                selectedCategory === null
                  ? 'bg-[#FF9619] text-white border-[#FF9619]'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              الكل
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border ${
                  selectedCategory === category.id
                    ? 'bg-[#FF9619] text-white border-[#FF9619]'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Alphabet Navigation */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-bold text-gray-400 mb-4 text-center">البحث بالحرف الأول</h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`w-10 h-10 rounded-lg text-sm font-bold ${
                  selectedLetter === null
                    ? 'bg-[#FF9619] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                الكل
              </button>
              {arabicLetters.map((letter) => {
                const hasTerms = terms.some(t => t.word.startsWith(letter));
                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                    disabled={!hasTerms}
                    className={`w-10 h-10 rounded-lg text-sm font-bold ${
                      selectedLetter === letter
                        ? 'bg-[#FF9619] text-white'
                        : hasTerms
                        ? 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                        : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-40'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Terms List */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {sortedLetters.length > 0 ? (
            <div className="space-y-12">
              {sortedLetters.map((letter) => (
                <div key={letter} id={letter}>
                  {/* Letter Header */}
                  <div className="sticky top-20 bg-[#0F2837] py-4 border-b border-white/10 mb-6 z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF9619] to-[#FAC39B] flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{letter}</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">حرف {letter}</h2>
                        <p className="text-sm text-gray-400">{groupedTerms[letter].length} مصطلح</p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {groupedTerms[letter].map((term) => {
                      const category = categories.find(c => c.id === term.category);
                      return (
                        <div
                          key={term.id}
                          className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-white mb-2">{term.word}</h3>
                              <div className="flex items-center gap-2">
                                {category && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-sm text-gray-300">
                                    {category.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Definition */}
                          <div className="mb-4">
                            <p className="text-gray-300 leading-relaxed">{term.definition}</p>
                          </div>

                          {/* Example */}
                          {term.example && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                              <div className="flex items-start gap-3">
                                <Quote className="w-5 h-5 text-[#FAC39B] flex-shrink-0 mt-1" />
                                <div>
                                  <p className="text-xs font-bold text-gray-400 mb-2">مثال على الاستخدام:</p>
                                  <p className="text-gray-300 leading-relaxed italic">{term.example}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Source */}
                          {term.source && (
                            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                              <BookOpen className="w-4 h-4 text-[#FAC39B]" />
                              <span className="text-sm text-gray-400">المصدر:</span>
                              <span className="text-sm text-gray-300 font-medium">{term.source}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">لا توجد نتائج</h3>
              <p className="text-gray-400">جرب تعديل معايير البحث أو التصفية</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
