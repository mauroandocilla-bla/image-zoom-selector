interface StageSize {
  width: number;
  height: number;
}

interface ImageSize {
  width: number;
  height: number;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const normalizeRect = (rect: Rect): Rect => {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  const width = Math.abs(rect.width);
  const height = Math.abs(rect.height);
  return { x, y, width, height };
}; 

export const calculateBounds = (
  stageSize: StageSize,
  imageSize: ImageSize,
  scale: number
): Bounds => {
  const scaledWidth = imageSize.width * scale;
  const scaledHeight = imageSize.height * scale;
  const minX = Math.min(0, stageSize.width - scaledWidth);
  const minY = Math.min(0, stageSize.height - scaledHeight);
  const maxX = 0;
  const maxY = 0;

  return { minX, minY, maxX, maxY };
};

export const calculateScale = (
  oldScale: number,
  deltaY: number,
  ctrlKey: boolean,
  minScale = 1,
  maxScale = 100
): number => {
  const scaleBy = 1.04;
  const isZoomIn = deltaY < 0 !== ctrlKey;
  return Math.min(
    maxScale,
    Math.max(minScale, isZoomIn ? oldScale * scaleBy : oldScale / scaleBy)
  );
};

export const calculatePosition = (
  pointer: { x: number; y: number },
  imagePosition: { x: number; y: number },
  oldScale: number,
  newScale: number,
  bounds: Bounds
): { x: number; y: number } => {
  const mousePointTo = {
    x: (pointer.x - imagePosition.x) / oldScale,
    y: (pointer.y - imagePosition.y) / oldScale,
  };

  const newX = pointer.x - mousePointTo.x * newScale;
  const newY = pointer.y - mousePointTo.y * newScale;

  return {
    x: Math.max(bounds.minX, Math.min(newX, bounds.maxX)),
    y: Math.max(bounds.minY, Math.min(newY, bounds.maxY)),
  };
};

export const calculateCenterPosition = (
  stageSize: StageSize,
  imageSize: ImageSize
): { x: number; y: number } => {
  return {
    x: (stageSize.width - imageSize.width) / 2,
    y: (stageSize.height - imageSize.height) / 2,
  };
}; 