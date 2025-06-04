'use client';

import { useLoading } from './loading-provider';
import { Loader2 } from 'lucide-react';

export const GlobalLoadingIndicator = () => {
  const { isAnyLoading } = useLoading();

  if (!isAnyLoading()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Bitte warten...</p>
      </div>
    </div>
  );
}; 