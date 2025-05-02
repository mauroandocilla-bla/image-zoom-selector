import { useCallback, useEffect } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { useTemporaryState } from "../useTemporaryState";
import {
  calculateBounds,
  calculateScale,
  calculatePosition,
} from "../../utils/image";

interface UseImageZoomProps {
  onZoomStateChange?: (isZooming: boolean) => void;
}

export const useImageZoom = ({ onZoomStateChange }: UseImageZoomProps = {}) => {
  const [isZooming, activateZooming] = useTemporaryState();

  useEffect(() => {
    if (onZoomStateChange) {
      onZoomStateChange(isZooming);
    }
  }, [isZooming, onZoomStateChange]);

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      activateZooming();

      const image = e.target;
      const stage = image.getStage();
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) return;

      const oldScale = image.scaleX();
      const newScale = calculateScale(oldScale, e.evt.deltaY, e.evt.ctrlKey);

      const bounds = calculateBounds(
        { width: stage.width(), height: stage.height() },
        { width: image.width(), height: image.height() },
        newScale
      );

      const newPosition = calculatePosition(
        pointer,
        image.position(),
        oldScale,
        newScale,
        bounds
      );

      image.scale({ x: newScale, y: newScale });
      image.position(newPosition);
    },
    [activateZooming]
  );

  return {
    isZooming,
    handleWheel,
  };
};
