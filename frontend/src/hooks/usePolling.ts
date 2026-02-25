'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function usePolling<T>(
  fetcher: () => Promise<T>,
  shouldStop: (data: T) => boolean,
  intervalMs = 3000,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const activeRef = useRef(false);

  const start = useCallback(() => {
    activeRef.current = true;
    setPolling(true);
    setError(null);

    const poll = async () => {
      if (!activeRef.current) return;
      try {
        const result = await fetcher();
        setData(result);
        if (shouldStop(result)) {
          activeRef.current = false;
          setPolling(false);
          return;
        }
        if (activeRef.current) {
          timerRef.current = setTimeout(poll, intervalMs);
        }
      } catch (e: any) {
        setError(e.message || 'Polling error');
        activeRef.current = false;
        setPolling(false);
      }
    };

    poll();
  }, [fetcher, shouldStop, intervalMs]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setPolling(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { data, error, polling, start, stop };
}
