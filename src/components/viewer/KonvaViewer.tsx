import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Rect } from "react-konva";
import useImage from "use-image";
import "./KonvaViewer.css";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import { ZoomIcon, DragIcon, SelectIcon, ResetIcon } from "../common/icons";
import Tooltip from "../common/Tooltip";

interface KonvaViewerProps {
  imageUrl: string;
  onDragStateChange?: (isDragging: boolean) => void;
  onZoomStateChange?: (isZooming: boolean) => void;
  onSelectStateChange?: (isSelecting: boolean) => void;
  onResetStateChange?: (isResetting: boolean) => void;
  onSelectionBlob?: (blob: Blob) => void;
}

interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const normalizeRect = (rect: SelectionRect) => {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  const width = Math.abs(rect.width);
  const height = Math.abs(rect.height);
  return { x, y, width, height };
};

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
  const zoomTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // State to track current scale and dimensions
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  // Reference to parent container

  // Dimensions and position of the image
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

  const [isZooming, setIsZooming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isComponentFocused, setIsComponentFocused] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const { width, height } = node.getClientRect();

    const stage = node.getStage();
    if (!stage) return;

    const stageWidth = stage.width();
    const stageHeight = stage.height();

    const minX = stageWidth - width;
    const minY = stageHeight - height;

    const clampedX = Math.min(0, Math.max(minX, node.x()));
    const clampedY = Math.min(0, Math.max(minY, node.y()));

    node.position({ x: clampedX, y: clampedY });
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    setIsZooming(true);

    // Clear any existing timeout
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }

    // Set a new timeout
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZooming(false);
    }, 100);

    const imageNode = e.target;
    const stage = imageNode.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;

    const oldScale = imageNode.scaleX();
    const scaleBy = 1.04;
    const minScale = 1;
    const maxScale = 100;

    const isZoomIn = e.evt.deltaY < 0 !== e.evt.ctrlKey;
    const newScale = Math.min(
      maxScale,
      Math.max(minScale, isZoomIn ? oldScale * scaleBy : oldScale / scaleBy)
    );

    const mousePointTo = {
      x: (pointer.x - imageNode.x()) / oldScale,
      y: (pointer.y - imageNode.y()) / oldScale,
    };

    // Nueva posición basada en el cursor
    let newX = pointer.x - mousePointTo.x * newScale;
    let newY = pointer.y - mousePointTo.y * newScale;

    // Obtener tamaño del nodo escalado
    const scaledWidth = imageNode.width() * newScale;
    const scaledHeight = imageNode.height() * newScale;

    const stageWidth = stage.width();
    const stageHeight = stage.height();

    // Clampear posición para que la imagen no se salga
    const minX = Math.min(0, stageWidth - scaledWidth);
    const minY = Math.min(0, stageHeight - scaledHeight);
    const maxX = 0;
    const maxY = 0;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    // Aplicar escala y posición
    imageNode.scale({ x: newScale, y: newScale });
    imageNode.position({ x: newX, y: newY });
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (!isSelecting) return;
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setSelectionStart(pos);
    setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
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

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (!isSelecting || !stageRef.current) return;

    const selection = normalizeRect(selectionRect);

    if (selectionRectRef.current) {
      selectionRectRef.current.visible(false);
      selectionRectRef.current.getLayer()?.batchDraw();
    }

    // Obtener el nodo de la imagen
    const imageNode = imageNodeRef.current;
    if (!imageNode) return;

    const stage = stageRef.current;
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    
    // Calcular la escala necesaria para que la selección ocupe exactamente el stage
    const scaleX = stageWidth / selection.width;
    const scaleY = stageHeight / selection.height;
    const newScale = Math.min(scaleX, scaleY);

    // Obtener la escala actual y asegurar que el nuevo zoom sea significativamente mayor
    const currentScale = imageNode.scaleX();
    const finalScale = Math.max(newScale, currentScale * 2); // Asegurar al menos un zoom 2x

    // Obtener la posición actual de la imagen
    const currentX = imageNode.x();
    const currentY = imageNode.y();

    // Calcular el centro de la selección en coordenadas del stage
    const selectionCenterX = selection.x + selection.width / 2;
    const selectionCenterY = selection.y + selection.height / 2;

    // Convertir el centro de la selección a coordenadas relativas a la imagen
    const relativeCenterX = (selectionCenterX - currentX) / currentScale;
    const relativeCenterY = (selectionCenterY - currentY) / currentScale;

    // Calcular la nueva posición para centrar la selección
    let newX = stageWidth / 2 - relativeCenterX * finalScale;
    let newY = stageHeight / 2 - relativeCenterY * finalScale;

    // Calcular los límites para mantener la imagen dentro del stage
    const imageWidth = imageNode.width() * finalScale;
    const imageHeight = imageNode.height() * finalScale;

    // Asegurar que la imagen no se salga del stage
    const minX = Math.min(0, stageWidth - imageWidth);
    const minY = Math.min(0, stageHeight - imageHeight);
    const maxX = 0;
    const maxY = 0;

    // Aplicar los límites
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    // Aplicar el zoom y la posición
    imageNode.scale({ x: finalScale, y: finalScale });
    imageNode.position({ x: newX, y: newY });
    imageNode.getLayer()?.batchDraw();

    // Esperar a que el zoom se complete antes de capturar
    setTimeout(() => {
      // Calcular las coordenadas de la selección después del zoom
      const scaledSelectionX = (selection.x - currentX) / currentScale * finalScale + newX;
      const scaledSelectionY = (selection.y - currentY) / currentScale * finalScale + newY;
      const scaledSelectionWidth = selection.width / currentScale * finalScale;
      const scaledSelectionHeight = selection.height / currentScale * finalScale;

      const canvas = stage.toCanvas({
        x: scaledSelectionX,
        y: scaledSelectionY,
        width: scaledSelectionWidth,
        height: scaledSelectionHeight,
      });

      canvas.toBlob((blob) => {
        if (selectionRectRef.current) {
          selectionRectRef.current.visible(true);
          selectionRectRef.current.getLayer()?.batchDraw();
        }

        if (blob && onSelectionBlob) {
          onSelectionBlob(blob);
        }
      }, "image/png");
    }, 100);

    setSelectionStart(null);
    setSelectionRect({ x: 0, y: 0, width: 0, height: 0 });
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (onDragStateChange) onDragStateChange(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragStateChange) onDragStateChange(false);
  };

  // Function to handle resize
  const updateSize = () => {
    if (!containerRef.current || !img) return;

    // Get container size
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    // Get image and container ratio
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

    // Update state with new dimensions
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

  // Update on mount and when window resizes
  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
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

  const handleDoubleClick = () => {
    if (!imageNodeRef.current) return;

    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 100);

    // Reset scale to 1
    imageNodeRef.current.scale({ x: 1, y: 1 });

    // Reset position to center
    const stage = stageRef.current;
    if (!stage) return;

    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const imageWidth = imageNodeRef.current.width();
    const imageHeight = imageNodeRef.current.height();

    const x = (stageWidth - imageWidth) / 2;
    const y = (stageHeight - imageHeight) / 2;

    imageNodeRef.current.position({ x, y });
    imageNodeRef.current.getLayer()?.batchDraw();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);

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
      <div className="state-indicators">
        <div className="indicators-group">
          <div className="state-indicators-label">State Indicators</div>
          <div className="indicators-list">
            <Tooltip content="Use mouse wheel to zoom in/out">
              <div className={`indicator ${isZooming ? "active" : ""}`}>
                <ZoomIcon />
              </div>
            </Tooltip>
            <Tooltip content="Click and drag to move the image">
              <div className={`indicator ${isDragging ? "active" : ""}`}>
                <DragIcon />
              </div>
            </Tooltip>
            <Tooltip content="Hold Shift and drag to select an area">
              <div className={`indicator ${isSelecting ? "active" : ""}`}>
                <SelectIcon />
              </div>
            </Tooltip>
            <Tooltip content="Double click to reset view">
              <div className={`indicator ${isResetting ? "active" : ""}`}>
                <ResetIcon />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}>
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
          />
          {isSelecting && (
            <Rect
              ref={selectionRectRef}
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 162, 255, 0.3)"
              stroke="rgba(0, 162, 255, 0.8)"
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaViewer;
