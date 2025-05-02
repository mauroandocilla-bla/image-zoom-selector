import { useState, useEffect } from "react";
import { Size } from "../ui/useResizeObserver";

interface UseImageDimensionsProps {
  img: HTMLImageElement | null | undefined;
  containerSize: Size;
}

interface ImageProps {
  width: number;
  height: number;
  x: number;
  y: number;
}

export const useImageDimensions = ({
  img,
  containerSize,
}: UseImageDimensionsProps) => {
  const [imageProps, setImageProps] = useState<ImageProps>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!img) return;

    const imageRatio = img.width / img.height;
    const containerRatio = containerSize.width / containerSize.height;

    let drawWidth, drawHeight;

    if (imageRatio > containerRatio) {
      drawHeight = containerSize.height;
      drawWidth = img.width * (containerSize.height / img.height);
    } else {
      drawWidth = containerSize.width;
      drawHeight = img.height * (containerSize.width / img.width);
    }

    const offsetX = (containerSize.width - drawWidth) / 2;
    const offsetY = (containerSize.height - drawHeight) / 2;

    setImageProps({
      width: drawWidth,
      height: drawHeight,
      x: offsetX,
      y: offsetY,
    });
  }, [img, containerSize]);

  return imageProps;
}; 