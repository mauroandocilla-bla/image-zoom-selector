import React, { useRef } from "react";
import { Stage, Layer, Image, Rect as KonvaRect } from "react-konva";
import useImage from "use-image";
import "./ImageViewer.css";
import Konva from "konva";
import StateIndicators from "./StateIndicators";
import BrightnessControls from "./BrightnessControls";
import { useImageZoom } from "../../hooks/image/useImageZoom";
import { useImageDrag } from "../../hooks/image/useImageDrag";
import { useImageReset } from "../../hooks/image/useImageReset";
import { useImageSelection } from "../../hooks/image/useImageSelection";
import { useImageDimensions } from "../../hooks/image/useImageDimensions";
import { useResizeObserver } from "../../hooks/ui/useResizeObserver";

interface ImageViewerProps {
  imageUrl: string;
  onDragStateChange?: (isDragging: boolean) => void;
  onZoomStateChange?: (isZooming: boolean) => void;
  onSelectStateChange?: (isSelecting: boolean) => void;
  onResetStateChange?: (isResetting: boolean) => void;
  onSelectionBlob?: (blob: Blob) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  onDragStateChange,
  onZoomStateChange,
  onSelectStateChange,
  onResetStateChange,
  onSelectionBlob,
}) => {
  const [image] = useImage(imageUrl, "anonymous");

  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);
  const selectionRef = useRef<Konva.Rect>(null);

  const { isZooming, handleWheel } = useImageZoom({ onZoomStateChange });
  const { isDragging, handleDragMove, handleDragStart, handleDragEnd } =
    useImageDrag({ onDragStateChange });
  const { isResetting, handleDoubleClick } = useImageReset({
    onResetStateChange,
    imageNodeRef: imageRef,
    stageRef,
  });
  const { containerRef, size: stageSize } = useResizeObserver();
  const {
    isSelecting,
    selectionRect,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleFocus,
    handleBlur,
  } = useImageSelection({
    onSelectStateChange,
    onSelectionBlob,
    stageRef,
    imageNodeRef: imageRef,
    selectionRectRef: selectionRef,
  });
  const imageProps = useImageDimensions({
    img: image,
    containerSize: stageSize,
  });

  const handleBrightnessChange = (value: number) => {
    if (image && imageRef.current) {
      imageRef.current.cache();
      imageRef.current.brightness(value);
    }
  };

  return (
    <div
      ref={containerRef}
      className="konva-container"
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}>
      <BrightnessControls
        min={0}
        max={1}
        step={0.01}
        onBrightnessChange={handleBrightnessChange}
      />
      <StateIndicators
        isZooming={isZooming}
        isDragging={isDragging}
        isSelecting={isSelecting}
        isResetting={isResetting}
      />
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onDblClick={handleDoubleClick}
        listening={true}
        draggable={false}>
        <Layer>
          <Image
            ref={imageRef}
            image={image}
            x={imageProps.x}
            y={imageProps.y}
            width={imageProps.width}
            height={imageProps.height}
            draggable={!isSelecting}
            onDragMove={handleDragMove}
            onWheel={handleWheel}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            perfectDrawEnabled={false}
            filters={[Konva.Filters.Brighten]}
          />
          {isSelecting && (
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
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageViewer;
