import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const mainNavItems = [
    { path: '/stories', label: 'القصص' },
    { path: '/guide', label: 'دليل جمع القصص', isNew: true },
    { path: '/pioneers', label: 'رواد التراث' },
    { path: '/blog', label: 'المدونة' },
    { path: '/glossary', label: 'مسرد الألفاظ' },
  ];

  const dropdownItems = [
    { path: '/gallery', label: 'معرض الصور' },
    { path: '/library', label: 'مكتبة الكتب' },
    { path: '/ambassador', label: 'كن سفيراً', isHighlighted: true }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-[#0F2837]/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link 
            to="/" 
            className="hover:opacity-80 transition-opacity transform hover:scale-105 duration-300"
            aria-label="الصفحة الرئيسية"
          >
            <img 
              src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" 
              alt="سواليفهم" 
             className="h-16 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {/* Main Navigation Items */}
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-gray-300 hover:text-white transition-all duration-300 relative group ${
                  location.pathname === item.path ? 'text-white' : ''
                }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <div className="flex items-center">
                  <span className="relative">
                    {item.label}
                    {item.isNew && (
                      <span className="absolute -top-4 right-0 bg-[#FF9619] text-[#0F2837] px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse whitespace-nowrap">
                        جديد
                      </span>
                    )}
                  </span>
                </div>
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FAC39B] transition-all duration-300 group-hover:w-full ${
                  location.pathname === item.path ? 'w-full' : ''
                }`} />
              </Link>
            ))}

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-all duration-300"
              >
                المزيد
                {isDropdownOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0F2837] rounded-lg shadow-lg border border-white/10 py-2 animate-fade-in">
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors ${
                        location.pathname === item.path ? 'text-white bg-white/5' : ''
                      } ${
                        item.isHighlighted ? 'text-[#FAC39B] hover:text-[#FF9619]' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Call to Action */}
            <Link 
              to="/apply"
              className="bg-[#FF9619] text-[#0F2837] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#FAC39B] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              aria-label="ابدأ رحلتك التوثيقية"
            >
              ابدأ الآن
            </Link>
          </div>

          <button 
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="py-4 space-y-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block text-gray-300 hover:text-white transition-all duration-300 py-2 relative ${
                  location.pathname === item.path ? 'text-white bg-white/5 rounded-lg px-4' : ''
                }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <div className="flex items-center">
                  <span className="relative">
                    {item.label}
                    {item.isNew && (
                      <span className="absolute -top-3 right-0 bg-[#FF9619] text-[#0F2837] px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse whitespace-nowrap">
                        جديد
                      </span>
                    )}
                  </span>
                </div>
              </Link>
            ))}

            {dropdownItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block text-gray-300 hover:text-white transition-all duration-300 py-2 relative ${
                  location.pathname === item.path ? 'text-white bg-white/5 rounded-lg px-4' : ''
                } ${
                  item.isHighlighted ? 'text-[#FAC39B] hover:text-[#FF9619]' : ''
                }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}

            <Link 
              to="/apply"
              className="block w-full bg-[#FF9619] text-[#0F2837] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#FAC39B] transition-all duration-300 text-center shadow-lg hover:shadow-xl"
              aria-label="ابدأ رحلتك التوثيقية"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}