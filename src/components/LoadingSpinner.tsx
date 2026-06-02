import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  overlay?: boolean;
}

export default function LoadingSpinner({ size = 'md', className, overlay = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const spinner = (
    <div className={`relative ${className || ''}`}>
      <div className={`border-2 border-white/20 border-t-[#FAC39B] rounded-full animate-spin ${sizes[size]}`} />
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-[#0F2837]/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}