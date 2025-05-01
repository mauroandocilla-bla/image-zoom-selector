import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Image, Rect as KonvaRect } from "react-konva";
import useImage from "use-image";
import "./KonvaViewer.css";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import StateIndicators from "./StateIndicators";
import { useTemporaryState } from "../../hooks/useTemporaryState";
import {
  calculateBounds,
  calculateScale,
  calculatePosition,
  calculateCenterPosition,
  Rect as SelectionRect,
  normalizeRect,
} from "../../utils/image";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const selectionRectRef = useRef<Konva.Rect>(null);
  const [isZooming, activateZooming] = useTemporaryState();
  const [isResetting, activateResetting] = useTemporaryState();

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageProps, setImageProps] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isComponentFocused, setIsComponentFocused] = useState(false);

  const handleImageDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
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

  const handleImageWheel = useCallback(
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

  const handleImageDragStart = useCallback(() => {
    setIsDragging(true);
    if (onDragStateChange) onDragStateChange(true);
  }, [onDragStateChange]);

  const handleImageDragEnd = useCallback(() => {
    setIsDragging(false);
    if (onDragStateChange) onDragStateChange(false);
  }, [onDragStateChange]);

  const handleStageMouseDown = () => {
    if (!isSelecting) return;
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setSelectionStart(pos);
    setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleStageMouseMove = () => {
    if (!isSelecting || !selectionStart) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const width = pos.x - selectionStart.x;
    const height = pos.y - selectionStart.y;

    setSelectionRect({
      x: selectionStart.x,
      y: selectionStart.y,
      width,
      height,
    });
  };

  const handleStageMouseUp = () => {
    if (!isSelecting || !stageRef.current || !imageNodeRef.current) return;

    const stage = stageRef.current;
    const imageNode = imageNodeRef.current;
    const selection = normalizeRect(selectionRect);

    selectionRectRef.current?.visible(false);
    selectionRectRef.current?.getLayer()?.batchDraw();

    const stageW = stage.width();
    const stageH = stage.height();
    const scale = Math.max(
      Math.min(stageW / selection.width, stageH / selection.height),
      imageNode.scaleX() * 2
    );

    const currentScale = imageNode.scaleX();
    const [currentX, currentY] = [imageNode.x(), imageNode.y()];
    const centerX = selection.x + selection.width / 2;
    const centerY = selection.y + selection.height / 2;

    let newX = stageW / 2 - ((centerX - currentX) / currentScale) * scale;
    let newY = stageH / 2 - ((centerY - currentY) / currentScale) * scale;

    const maxX = 0,
      maxY = 0;
    const minX = Math.min(0, stageW - imageNode.width() * scale);
    const minY = Math.min(0, stageH - imageNode.height() * scale);

    imageNode.scale({ x: scale, y: scale });
    imageNode.position({
      x: Math.max(minX, Math.min(newX, maxX)),
      y: Math.max(minY, Math.min(newY, maxY)),
    });
    imageNode.getLayer()?.batchDraw();

    setTimeout(() => {
      const sx =
        ((selection.x - currentX) / currentScale) * scale + imageNode.x();
      const sy =
        ((selection.y - currentY) / currentScale) * scale + imageNode.y();
      const sw = (selection.width / currentScale) * scale;
      const sh = (selection.height / currentScale) * scale;

      const canvas = stage.toCanvas({ x: sx, y: sy, width: sw, height: sh });

      canvas.toBlob((blob) => {
        selectionRectRef.current?.visible(true);
        selectionRectRef.current?.getLayer()?.batchDraw();
        if (blob && onSelectionBlob) onSelectionBlob(blob);
      }, "image/png");
    }, 100);

    setSelectionStart(null);
    setSelectionRect({ x: 0, y: 0, width: 0, height: 0 });
  };

  const handleStageDoubleClick = () => {
    if (!imageNodeRef.current || !stageRef.current) return;

    activateResetting();

    const imageNode = imageNodeRef.current;
    const stage = stageRef.current;

    imageNode.scale({ x: 1, y: 1 });

    const centerPosition = calculateCenterPosition(
      { width: stage.width(), height: stage.height() },
      { width: imageNode.width(), height: imageNode.height() }
    );

    imageNode.position(centerPosition);
    imageNode.getLayer()?.batchDraw();
  };

  const updateImageSize = () => {
    if (!containerRef.current || !img) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    const imageRatio = img.width / img.height;
    const containerRatio = containerWidth / containerHeight;

    let drawWidth, drawHeight;

    if (imageRatio > containerRatio) {
      drawHeight = containerHeight;
      drawWidth = img.width * (containerHeight / img.height);
    } else {
      drawWidth = containerWidth;
      drawHeight = img.height * (containerWidth / img.width);
    }

    setStageSize({
      width: containerWidth,
      height: containerHeight,
    });

    const offsetX = (containerWidth - drawWidth) / 2;
    const offsetY = (containerHeight - drawHeight) / 2;

    setImageProps({
      width: drawWidth,
      height: drawHeight,
      x: offsetX,
      y: offsetY,
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => updateImageSize());
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [img]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" && isComponentFocused) {
        setIsSelecting(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsSelecting(false);
      }
      setSelectionStart(null);
    };

    const handleFocus = () => {
      setIsComponentFocused(true);
    };

    const handleBlur = () => {
      setIsComponentFocused(false);
      setIsSelecting(false);
      setSelectionStart(null);
    };

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
  }, [isComponentFocused]);

  useEffect(() => {
    if (onZoomStateChange) {
      onZoomStateChange(isZooming);
    }
  }, [isZooming, onZoomStateChange]);

  useEffect(() => {
    if (onSelectStateChange) {
      onSelectStateChange(isSelecting);
    }
  }, [isSelecting, onSelectStateChange]);

  useEffect(() => {
    if (onResetStateChange) {
      onResetStateChange(isResetting);
    }
  }, [isResetting, onResetStateChange]);

  return (
    <div
      ref={containerRef}
      className="konva-container"
      onMouseEnter={() => setIsComponentFocused(true)}
      onMouseLeave={() => setIsComponentFocused(false)}>
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
        onDblClick={handleStageDoubleClick}
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
            onDragMove={handleImageDragMove}
            onWheel={handleImageWheel}
            onDragStart={handleImageDragStart}
            onDragEnd={handleImageDragEnd}
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
