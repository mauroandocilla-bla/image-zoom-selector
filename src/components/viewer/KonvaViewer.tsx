import React, { useRef } from "react";
import { Stage, Layer, Image, Rect as KonvaRect } from "react-konva";
import useImage from "use-image";
import "./KonvaViewer.css";
import Konva from "konva";
import StateIndicators from "./StateIndicators";
import { useZoom } from "../../hooks/image/useImageZoom";
import { useDrag } from "../../hooks/image/useImageDrag";
import { useReset } from "../../hooks/image/useImageReset";
import { useSelection } from "../../hooks/image/useImageSelection";
import { useImageDimensions } from "../../hooks/image/useImageDimensions";
import { useResizeObserver } from "../../hooks/ui/useResizeObserver";

interface KonvaViewerProps {
  imageUrl: string;
  onDragStateChange?: (isDragging: boolean) => void;
  onZoomStateChange?: (isZooming: boolean) => void;
  onSelectStateChange?: (isSelecting: boolean) => void;
  onResetStateChange?: (isResetting: boolean) => void;
  onSelectionBlob?: (blob: Blob) => void;
}

const KonvaViewer: React.FC<KonvaViewerProps> = ({
  imageUrl,
  onDragStateChange,
  onZoomStateChange,
  onSelectStateChange,
  onResetStateChange,
  onSelectionBlob,
}) => {
  const [img] = useImage(imageUrl, "anonymous");

  const stageRef = useRef<Konva.Stage>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const selectionRectRef = useRef<Konva.Rect>(null);
  const { isZooming, handleWheel } = useZoom({ onZoomStateChange });
  const { isDragging, handleDragMove, handleDragStart, handleDragEnd } =
    useDrag({ onDragStateChange });
  const { isResetting, handleDoubleClick } = useReset({
    onResetStateChange,
    imageNodeRef,
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
  } = useSelection({
    onSelectStateChange,
    onSelectionBlob,
    stageRef,
    imageNodeRef,
    selectionRectRef,
  });

  const imageProps = useImageDimensions({
    img,
    containerSize: stageSize,
  });

  return (
    <div
      ref={containerRef}
      className="konva-container"
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}>
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
            ref={imageNodeRef}
            image={img}
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
          />
          {isSelecting && (
            <KonvaRect
              ref={selectionRectRef}
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

export default KonvaViewer;
