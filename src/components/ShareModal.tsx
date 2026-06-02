import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail, Apple as WhatsApp } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export default function ShareModal({ isOpen, onClose, title, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`قصة من سواليفهم: ${title}`);
    const body = encodeURIComponent(`مرحباً،\n\nأحببت أن أشارك معك هذه القصة من موقع سواليفهم:\n\n${title}\n\n${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`شاهد هذه القصة من سواليفهم: ${title}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="مشاركة القصة مع صديق"
      className="max-w-[90vw] sm:max-w-sm md:max-w-md"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Share Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Button
            variant="secondary"
            onClick={handleEmailShare}
            className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
          >
            <Mail className="w-5 h-5" />
            البريد الإلكتروني
          </Button>
          <Button
            variant="secondary"
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
          >
            <WhatsApp className="w-5 h-5" />
            واتساب
          </Button>
        </div>

        {/* Copy Link */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            رابط القصة
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-grow bg-white/10 text-white rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FAC39B] text-sm sm:text-base"
            />
            <Button
              variant="secondary"
              onClick={handleCopy}
              className="flex-shrink-0 w-full sm:w-auto"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              <span className="sm:hidden ml-2">
                {copied ? 'تم النسخ' : 'نسخ الرابط'}
              </span>
            </Button>
          </div>
        </div>

        {/* Share Message */}
        <div className="text-center text-gray-400 text-xs sm:text-sm">
          شارك هذه القصة مع أصدقائك وساهم في حفظ تراثنا
        </div>
      </div>
    </Modal>
  );
}