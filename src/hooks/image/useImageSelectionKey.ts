import { useState, useCallback, useEffect } from "react";

interface UseImageSelectionKeyProps {
  onSelectStateChange?: (isSelecting: boolean) => void;
  selectionKey?: string;
}

export const useImageSelectionKey = ({
  onSelectStateChange,
  selectionKey,
}: UseImageSelectionKeyProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isComponentFocused, setIsComponentFocused] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectionKey) return;
      
      if (e.key === selectionKey && isComponentFocused) {
        setIsSelecting(true);
        if (onSelectStateChange) {
          onSelectStateChange(true);
        }
      }
    },
    [onSelectStateChange, isComponentFocused, selectionKey]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!selectionKey) return;
      
      if (e.key === selectionKey) {
        setIsSelecting(false);
        if (onSelectStateChange) {
          onSelectStateChange(false);
        }
      }
    },
    [onSelectStateChange, selectionKey]
  );

  const handleFocus = useCallback(() => {
    setIsComponentFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsComponentFocused(false);
    if (selectionKey) {
      setIsSelecting(false);
    }
  }, [selectionKey]);

  const setSelectionState = useCallback((state: boolean) => {
    setIsSelecting(state);
    if (onSelectStateChange) {
      onSelectStateChange(state);
    }
  }, [onSelectStateChange]);

  useEffect(() => {
    if (selectionKey) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      window.addEventListener("focus", handleFocus);
      window.addEventListener("blur", handleBlur);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("blur", handleBlur);
      };
    }
  }, [handleKeyDown, handleKeyUp, handleFocus, handleBlur, selectionKey]);

  return {
    isSelecting,
    setSelectionState,
    handleFocus,
    handleBlur,
  };
}; 