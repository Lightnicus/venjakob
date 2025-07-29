'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'centered' | 'fullscreen';
  className?: string;
}

export const LoadingIndicator = ({ 
  text = 'Bitte warten...', 
  size = 'md', 
  variant = 'inline',
  className 
}: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
        {text && (
          <span className={cn('text-gray-600', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'centered') {
    return (
      <div className={cn('flex items-center justify-center gap-2 py-8', className)}>
        <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
        {text && (
          <span className={cn('text-gray-600', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm', className)}>
        <div className="flex items-center gap-2 rounded-lg bg-white p-6 shadow-lg">
          <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
          {text && (
            <span className={cn('text-gray-600', textSizes[size])}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }

  return null;
}; 