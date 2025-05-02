import React from "react";
import { ZoomIcon, DragIcon, SelectIcon, ResetIcon } from "../common/icons";
import Tooltip from "../common/Tooltip";
import "./StateIndicators.css";

interface StateIndicatorsProps {
  isZooming: boolean;
  isDragging: boolean;
  isSelecting: boolean;
  isResetting: boolean;
}

const StateIndicators: React.FC<StateIndicatorsProps> = ({
  isZooming,
  isDragging,
  isSelecting,
  isResetting,
}) => {
  const indicators = [
    {
      condition: isZooming,
      icon: <ZoomIcon />,
      tooltip: "Use mouse wheel to zoom in/out",
    },
    {
      condition: isDragging,
      icon: <DragIcon />,
      tooltip: "Click and drag to move the image",
    },
    {
      condition: isSelecting,
      icon: <SelectIcon />,
      tooltip: "Hold Shift and drag to select an area",
    },
    {
      condition: isResetting,
      icon: <ResetIcon />,
      tooltip: "Double click to reset view",
    },
  ];

  return (
    <div className="state-indicators">
      <div className="indicators-group">
        <div className="state-indicators-label">State Indicators</div>
        <div className="indicators-list">
          {indicators.map(({ condition, icon, tooltip }, i) => (
            <Tooltip content={tooltip} key={i} position="right">
              <div className={`indicator ${condition ? "active" : ""}`}>
                {icon}
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StateIndicators;
