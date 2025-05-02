import React, { useRef, useState, useCallback, useEffect } from "react";
import { Stage, Layer, Image, Rect as KonvaRect, Group } from "react-konva";
import useImage from "use-image";
import "./ImageViewer.css";
import Konva from "konva";
import { useImageSelection } from "../../hooks/image/useImageSelection";
import { useImageCut } from "../../hooks/image/useImageCut";
import { useImageDimensions } from "../../hooks/image/useImageDimensions";
import { useResizeObserver } from "../../hooks/ui/useResizeObserver";
import { useImageReset } from "../../hooks/image/useImageReset";
import MiniMap from "./MiniMap";
import BrightnessControls from "./BrightnessControls";
import StateIndicators from "./StateIndicators";
import ViewportDebug from "./ViewportDebug";

interface SimpleImageViewerProps {
  imageUrl: string;
  onSelectStateChange?: (isSelecting: boolean) => void;
  onSelectionBlob?: (blob: Blob) => void;
  onResetStateChange?: (isResetting: boolean) => void;
}

const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({
  imageUrl,
  onSelectStateChange,
  onSelectionBlob,
  onResetStateChange,
}) => {
  const [image] = useImage(imageUrl, "anonymous");
  const [isCutting, setIsCutting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);
  const brightnessRef = useRef<Konva.Rect>(null);
  const selectionRef = useRef<Konva.Rect>(null);
  const cutRef = useRef<Konva.Rect>(null);

  const [brightness, setBrightness] = useState(0);

  const { containerRef, size: stageSize } = useResizeObserver();

  const {
    isSelecting,
    selectionRect,
    handleStageMouseDown: handleSelectMouseDown,
    handleStageMouseMove: handleSelectMouseMove,
    handleStageMouseUp: handleSelectMouseUp,
  } = useImageSelection({
    onSelectStateChange,
    stageRef,
    imageNodeRef: imageRef,
    selectionRectRef: selectionRef,
  });

  const {
    isCutting: isCuttingState,
    selectionRect: cutRect,
    handleStageMouseDown: handleCutMouseDown,
    handleStageMouseMove: handleCutMouseMove,
    handleStageMouseUp: handleCutMouseUp,
  } = useImageCut({
    onCutStateChange: setIsCutting,
    onSelectionBlob,
    stageRef,
    imageNodeRef: imageRef,
    selectionRectRef: cutRef,
  });

  const { isResetting, handleDoubleClick: resetImage } = useImageReset({
    onResetStateChange,
    imageNodeRef: imageRef,
    stageRef,
  });

  const imageProps = useImageDimensions({
    img: image,
    containerSize: stageSize,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && isFocused) {
        setIsCutting((prev) => !prev);
        if (onSelectStateChange) {
          onSelectStateChange(!isCutting);
        }
      }
    },
    [onSelectStateChange, isCutting, isFocused]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isCutting) {
      handleCutMouseDown();
    } else {
      handleSelectMouseDown();
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isCutting) {
      handleCutMouseMove();
    } else {
      handleSelectMouseMove();
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isCutting) {
      handleCutMouseUp();
    } else {
      handleSelectMouseUp();
    }
  };

  const handleDoubleClick = useCallback(() => {
    resetImage();
    setIsCutting(false);
    if (onSelectStateChange) {
      onSelectStateChange(false);
    }
  }, [resetImage, onSelectStateChange]);

  return (
    <div
      ref={containerRef}
      className="konva-container"
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        cursor: isCutting ? "crosshair" : "zoom-in",
      }}>
      <BrightnessControls
        min={0}
        max={0.5}
        onBrightnessChange={setBrightness}
      />
      <StateIndicators
        isZooming={false}
        isDragging={false}
        isSelecting={isSelecting}
        isResetting={isResetting}
      />
      {process.env.NODE_ENV === "development" && (
        <ViewportDebug stageRef={stageRef} imageRef={imageRef} />
      )}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        listening={true}
        onDblClick={handleDoubleClick}>
        <Layer>
          <Image
            ref={imageRef}
            image={image}
            x={imageProps.x}
            y={imageProps.y}
            width={imageProps.width}
            height={imageProps.height}
            draggable={false}
            perfectDrawEnabled={false}
          />
          <KonvaRect
            ref={brightnessRef}
            x={-200}
            y={-200}
            width={stageSize.width + 400}
            height={stageSize.height + 400}
            fill="white"
            listening={false}
            opacity={brightness}
          />
          {isSelecting && !isCutting && (
            <KonvaRect
              ref={selectionRef}
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 162, 255, 0.3)"
              stroke="rgba(0, 162, 255, 0.8)"
              strokeWidth={1}
              dash={[4, 4]}
              perfectDrawEnabled={false}
            />
          )}
          {isCuttingState && isCutting && (
            <Group>
              {/*  {cutRect.width > 0 && cutRect.height > 0 && (
                <Group
                  clipFunc={(ctx) => {
                    ctx.beginPath();
                    ctx.rect(0, 0, stageSize.width, stageSize.height);
                    ctx.rect(cutRect.x, cutRect.y, cutRect.width, cutRect.height);
                    ctx.fill('evenodd');
                  }}
                >
                  <KonvaRect
                    x={0}
                    y={0}
                    width={stageSize.width}
                    height={stageSize.height}
                    fill="rgba(0, 0, 0, 0.3)"
                    perfectDrawEnabled={false}
                  />
                </Group>
              )} */}
              <KonvaRect
                ref={cutRef}
                x={cutRect.x}
                y={cutRect.y}
                width={cutRect.width}
                height={cutRect.height}
                fill="transparent"
                stroke="rgba(255, 0, 0, 0.8)"
                strokeWidth={2}
                dash={[6, 6]}
                perfectDrawEnabled={false}
                cornerRadius={0}
                shadowColor="red"
                shadowBlur={10}
                shadowOpacity={0.3}
                shadowOffset={{ x: 0, y: 0 }}
              />
            </Group>
          )}
          {image && (
            <MiniMap
              stageRef={stageRef}
              imageRef={imageRef}
              containerWidth={stageSize.width}
              containerHeight={stageSize.height}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default SimpleImageViewer;
