import React, { useEffect, useRef, useMemo, useState } from "react";
import { Rect as KonvaRect } from "react-konva";
import Konva from "konva";
import { isValidNumber } from "../../utils/number";

interface MiniMapProps {
  stageRef: React.RefObject<Konva.Stage>;
  imageRef: React.RefObject<Konva.Image>;
  containerWidth: number;
  containerHeight: number;
}

interface ViewportState {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  imageWidth: number;
  imageHeight: number;
}

const MiniMap: React.FC<MiniMapProps> = ({
  stageRef,
  imageRef,
  containerWidth,
  containerHeight,
}) => {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const prevStateRef = useRef<ViewportState>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    scale: 1,
    imageWidth: 1,
    imageHeight: 1,
  });

  const getViewportState = (): ViewportState | null => {
    const stage = stageRef.current;
    const image = imageRef.current;

    if (!stage || !image) return null;

    const scale = image.scaleX();
    return {
      x: image.x(),
      y: image.y(),
      width: image.width() * scale,
      height: image.height() * scale,
      scale,
      imageWidth: image.width(),
      imageHeight: image.height(),
    };
  };

  const shallowEqual = (a: ViewportState, b: ViewportState): boolean => {
    return (
      a.x === b.x &&
      a.y === b.y &&
      a.width === b.width &&
      a.height === b.height &&
      a.scale === b.scale &&
      a.imageWidth === b.imageWidth &&
      a.imageHeight === b.imageHeight
    );
  };

  useEffect(() => {
    let animationFrameId: number;
    let isMounted = true;

    const loop = () => {
      if (!isMounted) return;

      const newState = getViewportState();
      if (newState && !shallowEqual(newState, prevStateRef.current)) {
        prevStateRef.current = newState;
        setUpdateTrigger((prev) => prev + 1); // Trigger re-render
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Memoize calculations that depend on container size
  const miniMapDimensions = useMemo(() => {
    const miniMapWidth = 100;
    const ratio =
      prevStateRef.current.imageWidth / prevStateRef.current.imageHeight || 1;

    let miniW = miniMapWidth;
    let miniH = miniW / ratio;

    return {
      miniW,
      miniH,
      miniX: containerWidth - miniW - 20,
      miniY: containerHeight - miniH - 20,
    };
  }, [containerWidth, containerHeight, updateTrigger]); // Add updateTrigger to dependencies

  // Memoize viewport rectangle calculations
  const viewportRect = useMemo(() => {
    const { miniW, miniH, miniX, miniY } = miniMapDimensions;
    const state = prevStateRef.current;

    const width =
      state.width !== 0 ? (containerWidth / state.width) * miniW : 0;
    const height =
      state.height !== 0 ? (containerHeight / state.height) * miniH : 0;
    const x =
      state.width !== 0 ? miniX + (-state.x / state.width) * miniW : miniX;
    const y =
      state.height !== 0 ? miniY + (-state.y / state.height) * miniH : miniY;

    return {
      width: isValidNumber(width) ? width : 0,
      height: isValidNumber(height) ? height : 0,
      x: isValidNumber(x) ? x : miniX,
      y: isValidNumber(y) ? y : miniY,
    };
  }, [miniMapDimensions, containerWidth, containerHeight, updateTrigger]); // Add updateTrigger to dependencies

  return (
    <>
      <KonvaRect
        x={miniMapDimensions.miniX}
        y={miniMapDimensions.miniY}
        width={miniMapDimensions.miniW}
        height={miniMapDimensions.miniH}
        fill="rgba(0, 30, 255, 0.5)"
        cornerRadius={4}
        listening={false}
      />
      <KonvaRect
        x={viewportRect.x}
        y={viewportRect.y}
        width={viewportRect.width}
        height={viewportRect.height}
        fill="rgba(51, 255, 0, 0.5)"
        strokeWidth={1}
        cornerRadius={2}
        listening={false}
      />
    </>
  );
};

export default MiniMap;
