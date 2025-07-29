'use client';

import { useLoading } from './loading-provider';
import { LoadingIndicator } from './loading-indicator';

export const GlobalLoadingIndicator = () => {
  const { isAnyLoading } = useLoading();

  if (!isAnyLoading()) {
    return null;
  }

  return <LoadingIndicator variant="fullscreen" />;
}; 