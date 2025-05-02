import { useEffect, useRef, useState } from "react";

export interface Size {
  width: number;
  height: number;
}

interface UseResizeObserverProps {
  onResize?: (size: Size) => void;
}

export const useResizeObserver = ({
  onResize,
}: UseResizeObserverProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (!containerRef.current) return;
      const newSize = {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      };
      setSize(newSize);
      if (onResize) onResize(newSize);
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    // Initial size
    updateSize();

    return () => observer.disconnect();
  }, [onResize]);

  return {
    containerRef,
    size,
  };
};
