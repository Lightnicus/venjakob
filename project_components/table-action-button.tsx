import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableActionButtonProps {
  icon: LucideIcon;
  title: string;
  onClick: () => Promise<void> | void;
  variant?: 'default' | 'destructive' | 'ghost';
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const TableActionButton = ({
  icon: Icon,
  title,
  onClick,
  variant = 'ghost',
  className,
  disabled = false,
  isLoading: externalLoading,
}: TableActionButtonProps) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoading || disabled) return;

    // Only use internal loading state if external loading is not provided
    if (externalLoading === undefined) {
      try {
        setInternalLoading(true);
        await onClick();
      } catch (error) {
        console.error('Action failed:', error);
      } finally {
        setInternalLoading(false);
      }
    } else {
      // External loading is managed by parent
      await onClick();
    }
  };

  const isDisabled = isLoading || disabled;

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "h-8 w-8 p-0",
        variant === 'destructive' && "text-red-600 hover:text-red-700 hover:bg-red-50",
        className
      )}
      title={title}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </Button>
  );
}; 