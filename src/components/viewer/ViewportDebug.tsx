import React, { useEffect, useState, useRef } from "react";
import Konva from "konva";

interface ViewportDebugProps {
  stageRef: React.RefObject<Konva.Stage>;
  imageRef: React.RefObject<Konva.Image>;
}

const ViewportDebug: React.FC<ViewportDebugProps> = ({
  stageRef,
  imageRef,
}) => {
  const [debugInfo, setDebugInfo] = useState({
    position: { x: 0, y: 0 },
    scale: 1,
    dimensions: { width: 0, height: 0 },
    viewport: { width: 0, height: 0 },
  });

  // Store previous values to detect changes
  const prevValues = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
  });

  useEffect(() => {
    let animationFrameId: number;

    const updateDebugInfo = () => {
      const stage = stageRef.current;
      const image = imageRef.current;

      if (stage && image) {
        const currentX = image.x();
        const currentY = image.y();
        const currentScale = image.scaleX();
        const currentWidth = image.width() * currentScale;
        const currentHeight = image.height() * currentScale;

        if (
          currentX !== prevValues.current.x ||
          currentY !== prevValues.current.y ||
          currentScale !== prevValues.current.scale ||
          currentWidth !== prevValues.current.width ||
          currentHeight !== prevValues.current.height
        ) {
          prevValues.current = {
            x: currentX,
            y: currentY,
            scale: currentScale,
            width: currentWidth,
            height: currentHeight,
          };

          setDebugInfo({
            position: { x: currentX, y: currentY },
            scale: currentScale,
            dimensions: {
              width: currentWidth,
              height: currentHeight,
            },
            viewport: {
              width: stage.width(),
              height: stage.height(),
            },
          });
        }
      }

      animationFrameId = requestAnimationFrame(updateDebugInfo);
    };

    animationFrameId = requestAnimationFrame(updateDebugInfo);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stageRef, imageRef]);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "10px",
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "12px",
        zIndex: 1000,
      }}>
      <div>
        Position: x={debugInfo.position.x.toFixed(2)}, y=
        {debugInfo.position.y.toFixed(2)}
      </div>
      <div>Scale: {debugInfo.scale.toFixed(2)}</div>
      <div>
        Dimensions: {debugInfo.dimensions.width.toFixed(2)} x{" "}
        {debugInfo.dimensions.height.toFixed(2)}
      </div>
      <div>
        Viewport: {debugInfo.viewport.width.toFixed(2)} x{" "}
        {debugInfo.viewport.height.toFixed(2)}
      </div>
    </div>
  );
};

export default ViewportDebug;
