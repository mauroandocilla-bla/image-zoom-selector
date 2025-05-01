import { useCallback, useRef } from 'react';

export const useTimeout = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const set = useCallback((callback: () => void, delay: number) => {
    clear();
    timeoutRef.current = setTimeout(callback, delay);
  }, [clear]);

  return { set, clear };
}; 