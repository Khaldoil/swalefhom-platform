import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'w-full bg-white/10 text-white rounded-lg px-4 py-2 transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/15',
              'hover:bg-white/15',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'ring-2 ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {(error || hint) && (
          <p className={cn(
            'text-sm',
            error ? 'text-red-400' : 'text-gray-400'
          )}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;