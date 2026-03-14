/**
 * Custom hook for fetching data from the API with fallback to mock data.
 * Automatically detects if a real API token exists and fetches accordingly.
 */
import { useState, useEffect } from 'react';

export function useApiData<T>(
  apiFetcher: () => Promise<T>,
  mockData: T,
  deps: any[] = []
): { data: T; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasToken = !!localStorage.getItem('access_token');

  const fetch = async () => {
    if (!hasToken) {
      setData(mockData);
      return;
    }
    setLoading(true);
    try {
      const result = await apiFetcher();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setData(mockData); // Fallback to mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [hasToken, ...deps]);

  return { data, loading, error, refetch: fetch };
}
