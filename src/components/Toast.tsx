import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variants = {
    success: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      icon: Info
    }
  };

  const Icon = variants[type].icon;

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm',
      'animate-slide-up transition-all duration-300',
      'shadow-lg shadow-black/5',
      variants[type].bg,
      variants[type].border
    )}>
      <div className="flex items-center gap-3">
        <Icon className={cn('w-5 h-5', variants[type].text)} />
        <p className={variants[type].text}>{message}</p>
        <button
          onClick={onClose}
          className={cn(
            'p-1 hover:bg-white/10 rounded-full transition-colors',
            variants[type].text
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}