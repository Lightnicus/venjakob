import { FC, ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  'aria-label': string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void | Promise<void>;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const IconButton: FC<IconButtonProps> = ({
  icon,
  loading = false,
  disabled = false,
  variant = 'ghost',
  className,
  'aria-label': ariaLabel,
  onClick,
  onKeyDown,
  onMouseDown,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Use external loading if provided, otherwise use internal loading
  const isLoading = loading !== undefined ? loading : internalLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || isLoading || disabled) return;
    
    // Only use internal loading if external loading is not provided
    if (loading === undefined) {
      try {
        const result = onClick(e);
        if (result instanceof Promise) {
          setInternalLoading(true);
          await result;
        }
      } catch (error) {
        console.error('IconButton async operation error:', error);
      } finally {
        setInternalLoading(false);
      }
    } else {
      // External loading is managed by parent
      await onClick(e);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!onKeyDown || isLoading || disabled) return;
    
    // Only use internal loading if external loading is not provided
    if (loading === undefined) {
      try {
        const result = onKeyDown(e);
        if (result instanceof Promise) {
          setInternalLoading(true);
          await result;
        }
      } catch (error) {
        console.error('IconButton async operation error:', error);
      } finally {
        setInternalLoading(false);
      }
    } else {
      // External loading is managed by parent
      await onKeyDown(e);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn('h-8 w-8 p-0', className)}
      aria-label={ariaLabel}
      disabled={disabled || isLoading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={onMouseDown}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        icon
      )}
    </Button>
  );
};

export default IconButton; 