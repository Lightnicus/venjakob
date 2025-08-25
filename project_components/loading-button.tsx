'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps {
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
  loadingText?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  title?: string;
  tabIndex?: number;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  children,
  loadingText,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  title,
  tabIndex,
}) => {
  const isDisabled = disabled || loading;
  const displayText = loading && loadingText ? loadingText : children;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
      title={title}
      tabIndex={tabIndex}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {displayText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
