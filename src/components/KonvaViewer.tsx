import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Rect } from "react-konva";
import useImage from "use-image";
import "./KonvaViewer.css";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

interface KonvaViewerProps {
  imageUrl: string;
  onDragStateChange?: (isDragging: boolean) => void;
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
  onSelectionBlob,
}) => {
  const [img] = useImage(imageUrl, "anonymous");
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const selectionRectRef = useRef<Konva.Rect>(null);

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

    const imageNode = e.target;
    const stage = imageNode.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;

    const oldScale = imageNode.scaleX();
    const scaleBy = 1.06;
    const minScale = 1;
    const maxScale = 10;

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

    // 1. Ocultar el rectángulo de selección
    if (selectionRectRef.current) {
      selectionRectRef.current.visible(false);
      selectionRectRef.current.getLayer()?.batchDraw();
    }

    // 2. Capturar la selección del Stage sin el rectángulo
    const canvas = stageRef.current.toCanvas({
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
    });

    canvas.toBlob((blob) => {
      // 3. Volver a mostrar el rectángulo de selección
      if (selectionRectRef.current) {
        selectionRectRef.current.visible(true);
        selectionRectRef.current.getLayer()?.batchDraw();
      }

      if (blob && onSelectionBlob) {
        onSelectionBlob(blob);
      }
    }, "image/png");

    setSelectionStart(null);
    setSelectionRect({ x: 0, y: 0, width: 0, height: 0 });
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
      if (e.key === "Shift") setIsSelecting(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsSelecting(false);
      setSelectionStart(null); // Reset
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "600px" }}
      className="konva-container">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        style={{ backgroundColor: "yellow" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}>
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
