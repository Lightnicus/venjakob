import { ReactNode } from 'react';
import { usePermissionGuard } from '@/hooks/use-permission-guard';

interface ManagementWrapperProps {
  title: string;
  permission: string;
  loading: boolean;
  children: ReactNode;
}

const ManagementWrapper = ({ title, permission, loading, children }: ManagementWrapperProps) => {
  const { isLoading: permissionLoading, hasAccess, AccessDeniedComponent } = usePermissionGuard(permission);

  // Permission loading state
  if (permissionLoading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Prüfe Berechtigungen...</div>
        </div>
      </div>
    );
  } else {
    if (!hasAccess && !loading) {
        return <AccessDeniedComponent />;
      }
    
      // Data loading state
      if (loading) {
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Lade Daten...</div>
            </div>
          </div>
        );
      }
  }

  // Access denied state
  

  // Render main content
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
};

export default ManagementWrapper; 