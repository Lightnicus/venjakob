import { useCallback } from 'react';
import { useLoading } from '@/project_components/loading-provider';

type AsyncActionOptions = {
  loadingKey: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

export const useAsyncAction = () => {
  const { setLoading } = useLoading();

  const executeAsync = useCallback(
    async function<T>(
      asyncFn: () => Promise<T>,
      { loadingKey, onSuccess, onError }: AsyncActionOptions
    ): Promise<T | undefined> {
      try {
        setLoading(loadingKey, true);
        const result = await asyncFn();
        onSuccess?.();
        return result;
      } catch (error) {
        console.error(`Error in async action ${loadingKey}:`, error);
        onError?.(error);
        return undefined;
      } finally {
        setLoading(loadingKey, false);
      }
    },
    [setLoading]
  );

  return { executeAsync };
}; 