import { ReactNode } from 'react';
import { usePermissionGuard } from '@/hooks/use-permission-guard';
import { AuthUser } from '@supabase/supabase-js';
import { User as DbUser } from '@/lib/db/schema';
import { LoadingIndicator } from './loading-indicator';

interface ManagementWrapperProps {
  title: string;
  permission: string;
  loading: boolean;
  children: ReactNode;
}

const ManagementWrapper = ({ title, permission, loading, children }: ManagementWrapperProps) => {
  const { isLoading: permissionLoading, hasAccess, AccessDeniedComponent, authUser, dbUser } = usePermissionGuard(permission);

  // Permission loading state
  if (permissionLoading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <LoadingIndicator text="Prüfe Berechtigungen..." variant="centered" />
      </div>
    );
  } else {
    if (!hasAccess && !loading && authUser && dbUser) {
        console.log('Access denied', hasAccess, loading, authUser, dbUser);
        return <AccessDeniedComponent />;
      }
    
      // Data loading state
      if (loading) {
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <LoadingIndicator text="Lade Daten..." variant="centered" />
          </div>
        );
      }
  }

  // Render main content
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
};

export default ManagementWrapper; 