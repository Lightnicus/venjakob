import { LucideIcon } from 'lucide-react';
import { TableActionButton } from './table-action-button';

export interface TableAction {
  icon: LucideIcon;
  title: string;
  onClick: () => Promise<void> | void;
  variant?: 'default' | 'destructive' | 'ghost';
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

interface TableActionsCellProps {
  actions: TableAction[];
  className?: string;
}

export const TableActionsCell = ({ 
  actions, 
  className = "flex items-center gap-1" 
}: TableActionsCellProps) => {
  return (
    <div className={className}>
      {actions.map((action, index) => (
        <TableActionButton
          key={index}
          icon={action.icon}
          title={action.title}
          onClick={action.onClick}
          variant={action.variant}
          className={action.className}
          disabled={action.disabled}
          isLoading={action.isLoading}
        />
      ))}
    </div>
  );
}; 