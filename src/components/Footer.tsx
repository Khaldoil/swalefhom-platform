import React, { useState, useEffect } from 'react';
import { Instagram, Twitter } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface FooterProps {
  showJuthoor?: boolean;
}

export default function Footer({ showJuthoor = false }: FooterProps) {
  const navigate = useNavigate();
  const [showAdminHint, setShowAdminHint] = useState(false);
  const [keySequence, setKeySequence] = useState('');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setKeySequence(prev => {
        const newSequence = (prev + e.key).slice(-5);
        if (newSequence === 'admin') {
          setShowAdminHint(true);
          return '';
        }
        return newSequence;
      });
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  const handleLogoClick = () => {
    if (showAdminHint) {
      navigate('/admin/login');
      setShowAdminHint(false);
    }
  };

  return (
    <footer className="bg-[#0F2837] py-12 mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <img 
            src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" 
            alt="سواليفهم" 
            className={`h-16 w-auto transform transition-all duration-300 ${
             showAdminHint ? 'hover:scale-110 cursor-pointer animate-pulse h-20' : 'hover:scale-105 h-20'
            }`}
            onClick={handleLogoClick}
          />
          <div className="flex gap-6">
            <a 
              href="https://www.instagram.com/swalefhom/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#FAC39B] transition-all duration-300 transform hover:scale-110"
              aria-label="تابعنا على انستجرام"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://x.com/swalefhom" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#FAC39B] transition-all duration-300 transform hover:scale-110"
              aria-label="تابعنا على منصة إكس"
            >
              <Twitter className="w-6 h-6" />
            </a>
          </div>
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <Link
                to="/privacy"
                className="text-sm text-gray-400 hover:text-[#FAC39B] transition-colors"
              >
                سياسة الخصوصية
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/terms"
                className="text-sm text-gray-400 hover:text-[#FAC39B] transition-colors"
              >
                شروط الاستخدام
              </Link>
            </div>
            <p className="text-gray-400 mb-2">
              جميع الحقوق محفوظة © 2024 سواليفهم{showJuthoor ? ' - جذور الثقافية' : ''}
            </p>
            <p className="text-sm text-gray-500">
              نحافظ على تراثنا ونوثق قصصنا لأجيال المستقبل
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}