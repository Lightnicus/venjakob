import { FC, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

type InlineRowCheckboxProps = {
  checked: boolean;
  onClick?: (checked: boolean) => void | Promise<void>;
  disabled?: boolean;
  'aria-label'?: string;
};

const InlineRowCheckbox: FC<InlineRowCheckboxProps> = ({ 
  checked, 
  onClick, 
  disabled = false,
  'aria-label': ariaLabel 
}) => {
  const [loading, setLoading] = useState(false);
  const isDisabled = disabled || loading;

  const handleCheckedChange = async (checkedValue: boolean) => {
    if (onClick && !isDisabled) {
      setLoading(true);
      try {
        await onClick(checkedValue);
      } catch (error) {
        console.error('Error updating checkbox:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
    }
  };

  return (
    <div onClick={handleClick} onKeyDown={handleKeyDown} className="flex items-center gap-1">
      <Checkbox
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={isDisabled}
        aria-label={ariaLabel}
      />
      {loading && (
        <Loader2 
          size={12} 
          className="animate-spin text-muted-foreground" 
          aria-label="Wird gespeichert..."
        />
      )}
    </div>
  );
};

export default InlineRowCheckbox; 