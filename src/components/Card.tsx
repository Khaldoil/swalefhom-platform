import React from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  imageUrl?: string;
}

export default function Card({ children, className, hover = true, onClick, imageUrl }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-sm rounded-xl border border-white/10',
        'transition-all duration-300',
        hover && 'hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5',
        onClick && 'cursor-pointer',
        'overflow-hidden',
        className
      )}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative w-full aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      <div className="p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}