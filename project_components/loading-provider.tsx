'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type LoadingState = {
  [key: string]: boolean;
};

type LoadingContextType = {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

type LoadingProviderProps = {
  children: ReactNode;
};

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  };

  const isLoading = (key: string) => {
    return loadingStates[key] ?? false;
  };

  const isAnyLoading = () => {
    return Object.values(loadingStates).some(Boolean);
  };

  return (
    <LoadingContext.Provider
      value={{
        loadingStates,
        setLoading,
        isLoading,
        isAnyLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}; 