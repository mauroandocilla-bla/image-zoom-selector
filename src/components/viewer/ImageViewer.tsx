import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Rect as KonvaRect, Group } from "react-konva";
import useImage from "use-image";
import "./ImageViewer.css";
import Konva from "konva";
import StateIndicators from "./StateIndicators";
import BrightnessControls from "./BrightnessControls";
import MiniMap from "./MiniMap";
import ViewportDebug from "./ViewportDebug";
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
  const [brightness, setBrightness] = useState(0);
  const [viewportState, setViewportState] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1
  });

  const stageRef = useRef<Konva.Stage>(null);
  const brightnessRef = useRef<Konva.Rect>(null);
  const imageRef = useRef<Konva.Image>(null);
  const selectionRef = useRef<Konva.Rect>(null);

  // Update viewport state on stage changes
  useEffect(() => {
    const updateViewport = () => {
      if (stageRef.current && imageRef.current) {
        const stage = stageRef.current;
        const image = imageRef.current;
        
        setViewportState({
          x: image.x(),
          y: image.y(),
          width: stage.width(),
          height: stage.height(),
          scale: image.scaleX()
        });
      }
    };

    // Update on mount
    updateViewport();

    // Update on stage changes
    const stage = stageRef.current;
    if (stage) {
      stage.on('transform', updateViewport);
      stage.on('dragmove', updateViewport);
      stage.on('wheel', updateViewport);
      stage.on('dblclick', updateViewport);
      stage.on('mousedown', updateViewport);
      stage.on('mouseup', updateViewport);
    }

    return () => {
      if (stage) {
        stage.off('transform', updateViewport);
        stage.off('dragmove', updateViewport);
        stage.off('wheel', updateViewport);
        stage.off('dblclick', updateViewport);
        stage.off('mousedown', updateViewport);
        stage.off('mouseup', updateViewport);
      }
    };
  }, []);

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

  // Update viewport when image is loaded and positioned
  useEffect(() => {
    if (image && imageRef.current && stageRef.current) {
      const stage = stageRef.current;
      const imageNode = imageRef.current;
      
      // Wait for the next frame to ensure image is positioned
      requestAnimationFrame(() => {
        setViewportState({
          x: imageNode.x(),
          y: imageNode.y(),
          width: stage.width(),
          height: stage.height(),
          scale: imageNode.scaleX()
        });
      });
    }
  }, [image, imageProps, isResetting, isSelecting]);

  return (
    <div
      ref={containerRef}
      className="konva-container"
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}>
      <BrightnessControls
        min={0}
        max={0.5}
        onBrightnessChange={setBrightness}
      />
      <StateIndicators
        isZooming={isZooming}
        isDragging={isDragging}
        isSelecting={isSelecting}
        isResetting={isResetting}
      />
      <ViewportDebug stageRef={stageRef} imageRef={imageRef} />
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
          {image && (
            <MiniMap
              imageWidth={imageProps.width}
              imageHeight={imageProps.height}
              viewportX={viewportState.x}
              viewportY={viewportState.y}
              viewportWidth={viewportState.width}
              viewportHeight={viewportState.height}
              scale={viewportState.scale}
              containerWidth={stageSize.width}
              containerHeight={stageSize.height}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageViewer;
