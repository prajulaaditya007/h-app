import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * A custom hook to lazy-load long lists in chunks using IntersectionObserver.
 * Keeps the initial DOM node count low, optimizing performance for large datasets.
 * 
 * @param items Full list of items to render
 * @param chunkSize Number of items to render per scroll step
 * @returns Object containing sliced visible items, hasMore flag, and the DOM ref target for scroll trigger.
 */
export function useLazyList<T>(items: T[], chunkSize = 50) {
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  // Reset visible count if the input items array reference or chunkSize changes
  const [prevItems, setPrevItems] = useState(items);
  const [prevChunkSize, setPrevChunkSize] = useState(chunkSize);

  if (items !== prevItems || chunkSize !== prevChunkSize) {
    setPrevItems(items);
    setPrevChunkSize(chunkSize);
    setVisibleCount(chunkSize);
  }

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + chunkSize, items.length));
  }, [items.length, chunkSize]);

  useEffect(() => {
    if (!hasMore) return;

    const currentTarget = observerTargetRef.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Load a bit early before user reaches the very bottom
    );

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
      observer.disconnect();
    };
  }, [loadMore, hasMore]);

  return { visibleItems, hasMore, observerTargetRef };
}
