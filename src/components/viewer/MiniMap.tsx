import React from "react";
import { Rect as KonvaRect } from "react-konva";

interface MiniMapProps {
  imageWidth: number;
  imageHeight: number;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  scale: number;
  containerWidth: number;
  containerHeight: number;
}

const MiniMap: React.FC<MiniMapProps> = ({
  imageWidth,
  imageHeight,
  viewportX,
  viewportY,
  viewportWidth,
  viewportHeight,
  scale,
  containerWidth,
  containerHeight,
}) => {
  // Calculate the size of the mini-map (20% of the container)
  const miniMapWidth = containerWidth * 0.2;
  const miniMapHeight = containerHeight * 0.2;

  // Calculate the aspect ratio of the image
  const imageAspectRatio = imageWidth / imageHeight;

  // Calculate the mini-map dimensions while maintaining aspect ratio
  let miniMapImageWidth = miniMapWidth;
  let miniMapImageHeight = miniMapWidth / imageAspectRatio;

  if (miniMapImageHeight > miniMapHeight) {
    miniMapImageHeight = miniMapHeight;
    miniMapImageWidth = miniMapHeight * imageAspectRatio;
  }

  // Calculate the position of the mini-map (bottom right corner)
  const miniMapX = containerWidth - miniMapImageWidth - 10;
  const miniMapY = containerHeight - miniMapImageHeight - 10;

  // Calculate the scaled image dimensions
  const scaledImageWidth = imageWidth * scale;
  const scaledImageHeight = imageHeight * scale;

  // Calculate the viewport rectangle in mini-map coordinates
  // The viewport size is inversely proportional to the scale
  const viewportRectWidth =
    (viewportWidth / scaledImageWidth) * miniMapImageWidth;
  const viewportRectHeight =
    (viewportHeight / scaledImageHeight) * miniMapImageHeight;

  // Calculate the viewport position, taking into account the image position and scale
  const viewportRectX =
    miniMapX + (-viewportX / scaledImageWidth) * miniMapImageWidth;
  const viewportRectY =
    miniMapY + (-viewportY / scaledImageHeight) * miniMapImageHeight;

  return (
    <>
      {/* Full image rectangle */}
      <KonvaRect
        x={miniMapX}
        y={miniMapY}
        width={miniMapImageWidth}
        height={miniMapImageHeight}
        fill="rgba(0, 0, 0, 0.5)"
        cornerRadius={4}
        listening={false}
      />
      {/* Viewport rectangle */}
      <KonvaRect
        x={viewportRectX}
        y={viewportRectY}
        width={viewportRectWidth}
        height={viewportRectHeight}
        fill="rgba(0, 162, 255, 0.3)"
        strokeWidth={1}
        cornerRadius={2}
        listening={false}
      />
    </>
  );
};

export default MiniMap;
