import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, children, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <select
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
        >
          {children ? (
            children
          ) : (
            <>
              <option value="" className="bg-[#0F2837]">اختر...</option>
              {options?.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[#0F2837]"
                >
                  {option.label}
                </option>
              ))}
            </>
          )}
        </select>
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

Select.displayName = 'Select';

export default Select;