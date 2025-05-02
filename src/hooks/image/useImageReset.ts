import { useCallback, useEffect } from "react";
import { useTemporaryState } from "../useTemporaryState";
import { calculateCenterPosition } from "../../utils/image";
import Konva from "konva";

interface UseImageResetProps {
  onResetStateChange?: (isResetting: boolean) => void;
  imageNodeRef: React.RefObject<Konva.Image>;
  stageRef: React.RefObject<Konva.Stage>;
}

export const useImageReset = ({ onResetStateChange, imageNodeRef, stageRef }: UseImageResetProps) => {
  const [isResetting, activateResetting] = useTemporaryState();

  useEffect(() => {
    if (onResetStateChange) {
      onResetStateChange(isResetting);
    }
  }, [isResetting, onResetStateChange]);

  const handleDoubleClick = useCallback(() => {
    const imageNode = imageNodeRef.current;
    const stage = stageRef.current;
    if (!imageNode || !stage) return;

    activateResetting();

    imageNode.scale({ x: 1, y: 1 });

    const centerPosition = calculateCenterPosition(
      { width: stage.width(), height: stage.height() },
      { width: imageNode.width(), height: imageNode.height() }
    );

    imageNode.position(centerPosition);
    imageNode.getLayer()?.batchDraw();
  }, [activateResetting, imageNodeRef, stageRef]);

  return {
    isResetting,
    handleDoubleClick,
  };
}; 