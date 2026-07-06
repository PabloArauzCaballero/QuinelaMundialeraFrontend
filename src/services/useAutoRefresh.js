import { useEffect, useRef } from 'react';
import { API_REFRESH_INTERVAL_MS } from './api';

const now = () => Date.now();

export const useAutoRefresh = (refreshFn, enabled = true) => {
  const refreshRef = useRef(refreshFn);
  const lastRunRef = useRef(now());

  useEffect(() => {
    refreshRef.current = refreshFn;
  }, [refreshFn]);

  useEffect(() => {
    if (!enabled) return undefined;

    const runRefresh = () => {
      lastRunRef.current = now();
      refreshRef.current?.();
    };

    const intervalId = window.setInterval(runRefresh, API_REFRESH_INTERVAL_MS);

    const refreshWhenVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (now() - lastRunRef.current >= API_REFRESH_INTERVAL_MS) runRefresh();
    };

    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [enabled]);
};
