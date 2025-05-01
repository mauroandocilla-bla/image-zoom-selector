import { useState, useCallback } from 'react';
import { useTimeout } from './useTimeout';

export const useTemporaryState = (initialState = false, timeout = 100) => {
  const [state, setState] = useState(initialState);
  const timeoutHook = useTimeout();

  const activate = useCallback(() => {
    setState(true);
    timeoutHook.set(() => setState(false), timeout);
  }, [timeout, timeoutHook]);

  return [state, activate] as const;
}; 