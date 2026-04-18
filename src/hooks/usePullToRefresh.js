import { useState, useCallback, useRef } from 'react';

/**
 * usePullToRefresh
 * Attaches touch events to a ref element.
 * Calls `onRefresh` when user pulls down far enough.
 * Returns { containerRef, isPulling, pullProgress (0-1), isRefreshing }
 */
export default function usePullToRefresh(onRefresh, threshold = 80) {
  const containerRef  = useRef(null);
  const startYRef     = useRef(null);
  const [pull, setPull]           = useState(0); // px pulled
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop > 0) return; // only trigger at top
    startYRef.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startYRef.current === null) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0) {
      // Dampen: feels like elastic rubber
      setPull(Math.min(dy * 0.45, threshold * 1.3));
    }
  }, [threshold]);

  const onTouchEnd = useCallback(async () => {
    if (startYRef.current === null) return;
    startYRef.current = null;

    if (pull >= threshold) {
      setIsRefreshing(true);
      setPull(0);
      try { await onRefresh(); } finally { setIsRefreshing(false); }
    } else {
      setPull(0);
    }
  }, [pull, threshold, onRefresh]);

  const handlers = { onTouchStart, onTouchMove, onTouchEnd };
  const pullProgress = Math.min(pull / threshold, 1);

  return { containerRef, handlers, isPulling: pull > 0, pullProgress, isRefreshing };
}
