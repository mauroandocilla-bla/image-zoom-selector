import { useRef, useState, useCallback, useEffect } from "react";
import Konva from "konva";
import { Rect as SelectionRect, normalizeRect } from "../../utils/image";

interface UseSelectionProps {
  onSelectStateChange?: (isSelecting: boolean) => void;
  onSelectionBlob?: (blob: Blob) => void;
  stageRef: React.RefObject<Konva.Stage>;
  imageNodeRef: React.RefObject<Konva.Image>;
  selectionRectRef: React.RefObject<Konva.Rect>;
}

export const useSelection = ({
  onSelectStateChange,
  onSelectionBlob,
  stageRef,
  imageNodeRef,
  selectionRectRef,
}: UseSelectionProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isComponentFocused, setIsComponentFocused] = useState(false);
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

  const handleStageMouseDown = useCallback(() => {
    if (!isSelecting) return;
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setSelectionStart(pos);
    setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  }, [isSelecting, stageRef]);

  const handleStageMouseMove = useCallback(() => {
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
  }, [isSelecting, selectionStart, stageRef]);

  const handleStageMouseUp = useCallback(() => {
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
  }, [
    isSelecting,
    stageRef,
    imageNodeRef,
    selectionRectRef,
    selectionRect,
    onSelectionBlob,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Shift" && isComponentFocused) {
        setIsSelecting(true);
        if (onSelectStateChange) {
          onSelectStateChange(true);
        }
      }
    },
    [onSelectStateChange, isComponentFocused]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsSelecting(false);
        if (onSelectStateChange) {
          onSelectStateChange(false);
        }
      }
      setSelectionStart(null);
    },
    [onSelectStateChange]
  );

  const handleFocus = useCallback(() => {
    setIsComponentFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsComponentFocused(false);
    setIsSelecting(false);
    setSelectionStart(null);
  }, []);

  useEffect(() => {
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
  }, [handleKeyDown, handleKeyUp, handleFocus, handleBlur]);

  return {
    isSelecting,
    selectionRect,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleFocus,
    handleBlur,
  };
}; 