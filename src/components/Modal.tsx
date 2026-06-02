import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-[95vw] sm:max-w-sm',
    md: 'max-w-[95vw] sm:max-w-md',
    lg: 'max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl',
    xl: 'max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex items-start sm:items-center justify-center min-h-full p-2 sm:p-4 py-4">
        <div className={cn(
          "bg-[#0F2837] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 w-full border border-white/10 my-auto",
          sizeClasses[size],
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            {title && (
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white pr-2">{title}</h3>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
