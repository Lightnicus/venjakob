import React from 'react';
import { useUser } from './use-user';
import { AuthUser } from '@supabase/supabase-js';
import { User as DbUser } from '@/lib/db/schema';

interface PermissionGuardResult {
  isLoading: boolean;
  hasAccess: boolean;
  AccessDeniedComponent: React.FC;
  authUser: AuthUser | null;
  dbUser: DbUser | null;
}

export const usePermissionGuard = (requiredResource: string): PermissionGuardResult => {
  const { hasPermission, loading: userLoading, authUser, dbUser } = useUser();

  const AccessDeniedComponent: React.FC = () => (
    <div className="p-4">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Zugriff verweigert
          </h3>
          <p className="text-gray-500">
            Sie haben keine Berechtigung, um auf diese Seite zuzugreifen.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Erforderliche Berechtigung: {requiredResource}
          </p>
        </div>
      </div>
    </div>
  );

  return {
    isLoading: userLoading,
    hasAccess: hasPermission(undefined, requiredResource),
    AccessDeniedComponent,
    authUser,
    dbUser,
  };
}; 