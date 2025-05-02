import React from "react";
import MultiOptionSwitch from "../common/MultiOptionSwitch";
import "./BehaviorPanel.css";

interface BehaviorPanelProps {
  selectedOption: number;
  onOptionChange: (index: number) => void;
}

const behaviorLabels: Record<number, string> = {
  0: "Navigate, Zoom, and Preview",
  1: "Click & Drag",
  2: "Mouse Scroll",
};

const BehaviorPanel: React.FC<BehaviorPanelProps> = ({
  selectedOption,
  onOptionChange,
}) => {
  const label = behaviorLabels[selectedOption] || "Default";

  return (
    <div className="behavior-panel">
      <h3 className="panel-title">UX Behavior ({label})</h3>
      <div className="panel-content">
        <MultiOptionSwitch
          options={["1", "2"]}
          initialSelected={selectedOption}
          onChange={onOptionChange}
        />
      </div>
    </div>
  );
};

export default BehaviorPanel;