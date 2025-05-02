import { useCallback, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';

interface UseImageDragProps {
  onDragStateChange?: (isDragging: boolean) => void;
}

export const useImageDrag = ({ onDragStateChange }: UseImageDragProps = {}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const stage = node.getStage();
    if (!stage) return;

    const { width, height } = node.getClientRect();
    const [stageW, stageH] = [stage.width(), stage.height()];
    const [minX, minY] = [stageW - width, stageH - height];

    node.position({
      x: Math.min(0, Math.max(minX, node.x())),
      y: Math.min(0, Math.max(minY, node.y())),
    });
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    if (onDragStateChange) onDragStateChange(true);
  }, [onDragStateChange]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (onDragStateChange) onDragStateChange(false);
  }, [onDragStateChange]);

  return {
    isDragging,
    handleDragMove,
    handleDragStart,
    handleDragEnd,
  };
}; 