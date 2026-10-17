import { useCallback, useEffect, useState } from 'react';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isColdStart: boolean;
  refetch: () => void;
}

export function useApi<T>(fetchFn: () => Promise<T>, deps: any[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isColdStart, setIsColdStart] = useState<boolean>(false);

  const execute = useCallback(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setIsColdStart(false);

    const timer = setTimeout(() => {
      if (isMounted) {
        setIsColdStart(true);
      }
    }, 4000);

    fetchFn()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
          setIsColdStart(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
          setIsColdStart(false);
        }
      })
      .finally(() => {
        clearTimeout(timer);
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, deps);

  useEffect(() => {
    const cleanup = execute();
    return cleanup;
  }, [execute]);

  return { data, loading, error, isColdStart, refetch: execute };
}
