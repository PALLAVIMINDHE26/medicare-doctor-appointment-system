import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/axios';

/**
 * Small data-fetching hook covering the loading/error/data trio that every
 * list page needs, plus a `refetch` for retry buttons and post-mutation
 * refreshes. `fetcher` should be a stable function (wrap in useCallback in
 * the caller) that returns a promise resolving to the data payload.
 */
export const useFetch = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
