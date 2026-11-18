import { useEffect, useRef } from 'react';

/** 화면 아래쪽에 닿으면 onLoad를 불러 다음 목록을 이어 받습니다. (무한 스크롤) */
function LoadMoreTrigger({ hasNext, isLoading = false, onLoad }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !hasNext || isLoading) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      onLoad?.();
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoad?.();
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNext, isLoading, onLoad]);

  if (!hasNext) return null;
  return <div ref={ref} aria-hidden="true" style={{ width: '100%', height: 1, gridColumn: '1 / -1' }} />;
}

export default LoadMoreTrigger;
