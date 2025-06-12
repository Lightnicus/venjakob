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
  
  const isLoading = loading || internalLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || isLoading || disabled) return;
    
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
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!onKeyDown || isLoading || disabled) return;
    
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