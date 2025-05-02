import { useState, useCallback } from "react";
import Konva from "konva";
import { Rect as SelectionRect, normalizeRect } from "../../utils/image";

interface UseImageCutProps {
  onCutStateChange?: (isCutting: boolean) => void;
  onSelectionBlob?: (blob: Blob) => void;
  stageRef: React.RefObject<Konva.Stage>;
  imageNodeRef: React.RefObject<Konva.Image>;
  selectionRectRef: React.RefObject<Konva.Rect>;
}

export const useImageCut = ({
  onCutStateChange,
  onSelectionBlob,
  stageRef,
  imageNodeRef,
  selectionRectRef,
}: UseImageCutProps) => {
  const [isCutting, setIsCutting] = useState(false);
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
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setIsCutting(true);
    if (onCutStateChange) {
      onCutStateChange(true);
    }
    setSelectionStart(pos);
    setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  }, [stageRef, onCutStateChange]);

  const handleStageMouseMove = useCallback(() => {
    if (!isCutting || !selectionStart) return;

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
  }, [isCutting, selectionStart, stageRef]);

  const handleStageMouseUp = useCallback(() => {
    if (!isCutting || !stageRef.current || !imageNodeRef.current) return;

    // Only process selection if there is a significant width and height
    if (Math.abs(selectionRect.width) < 5 || Math.abs(selectionRect.height) < 5) {
      setSelectionStart(null);
      setSelectionRect({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }

    const stage = stageRef.current;
    const imageNode = imageNodeRef.current;
    const selection = normalizeRect(selectionRect);

    selectionRectRef.current?.visible(false);
    selectionRectRef.current?.getLayer()?.batchDraw();

    const currentScale = imageNode.scaleX();
    const [currentX, currentY] = [imageNode.x(), imageNode.y()];

    // Calculate the actual coordinates in the image
    const sx = ((selection.x - currentX) / currentScale) * imageNode.scaleX() + imageNode.x();
    const sy = ((selection.y - currentY) / currentScale) * imageNode.scaleY() + imageNode.y();
    const sw = (selection.width / currentScale) * imageNode.scaleX();
    const sh = (selection.height / currentScale) * imageNode.scaleY();

    // Create canvas with the selected area
    const canvas = stage.toCanvas({ x: sx, y: sy, width: sw, height: sh });

    // Convert to blob
    canvas.toBlob((blob) => {
      selectionRectRef.current?.visible(true);
      selectionRectRef.current?.getLayer()?.batchDraw();
      if (blob && onSelectionBlob) onSelectionBlob(blob);
    }, "image/png");

    setSelectionStart(null);
    setSelectionRect({ x: 0, y: 0, width: 0, height: 0 });
  }, [
    isCutting,
    stageRef,
    imageNodeRef,
    selectionRectRef,
    selectionRect,
    onSelectionBlob,
  ]);

  return {
    isCutting,
    selectionRect,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
  };
}; 