import React, { useState } from "react";
import { BrightnessIcon } from "../common/icons";
import Tooltip from "../common/Tooltip";
import "./BrightnessControls.css";

interface BrightnessControlsProps {
  onBrightnessChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const BrightnessControls: React.FC<BrightnessControlsProps> = ({
  onBrightnessChange,
  min = 0,
  max = 1,
  step = 0.01,
}) => {
  const [showBrightnessSlider, setShowBrightnessSlider] = useState(false);
  const [brightness, setBrightness] = useState(min);

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setBrightness(value);
    onBrightnessChange?.(value);
  };

  return (
    <div className="brightness-controls">
      <Tooltip content="Adjust image brightness" position="left">
        <button
          className="brightness-button"
          onClick={() => setShowBrightnessSlider(!showBrightnessSlider)}>
          <BrightnessIcon />
        </button>
      </Tooltip>
      {showBrightnessSlider && (
        <div className="brightness-slider-container">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={brightness}
            onChange={handleBrightnessChange}
            className="brightness-slider"
          />
        </div>
      )}
    </div>
  );
};

export default BrightnessControls; 