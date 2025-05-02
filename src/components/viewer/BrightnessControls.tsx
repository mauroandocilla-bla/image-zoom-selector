import React, { useState, useRef } from "react";
import { BrightnessIcon } from "../common/icons";
import Tooltip from "../common/Tooltip";
import "./BrightnessControls.css";

interface BrightnessControlsProps {
  onBrightnessChange?: (value: number) => void;
  min?: number;
  max?: number;
  sensitivity?: number;
}

const BrightnessControls: React.FC<BrightnessControlsProps> = ({
  onBrightnessChange,
  min = 0,
  max = 1,
  sensitivity = 0.005,
}) => {
  const [brightness, setBrightness] = useState(min);
  const containerRef = useRef<HTMLDivElement>(null);

  const startXRef = useRef<number | null>(null);
  const initialBrightnessRef = useRef<number>(brightness);

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    initialBrightnessRef.current = brightness;
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (startXRef.current !== null) {
        const deltaX = moveEvent.clientX - startXRef.current;
        let newBrightness = initialBrightnessRef.current + deltaX * sensitivity;
        newBrightness = Math.max(min, Math.min(max, newBrightness));
        setBrightness(newBrightness);
        onBrightnessChange?.(newBrightness);
      }
    };

    const handleMouseUp = () => {
      startXRef.current = null;
      document.body.style.userSelect = "auto";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="brightness-controls" ref={containerRef}>
      <Tooltip
        content="Hold and drag left or right to adjust brightness"
        position="left">
        <div className="brightness-button-wrapper">
          <button className="brightness-button" onMouseDown={handleMouseDown}>
            <BrightnessIcon />
          </button>
          {brightness > 0 && (
            <span className="brightness-value">
              {Math.round(((brightness - min) / (max - min)) * 100)}%
            </span>
          )}
        </div>
      </Tooltip>
    </div>
  );
};

export default BrightnessControls;
