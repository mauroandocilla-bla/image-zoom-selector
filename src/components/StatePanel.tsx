import React from "react";
import "./StatePanel.css";
import { ZoomIcon, DragIcon, SelectIcon, ResetIcon } from "./icons";

interface StatePanelProps {
  isDragging: boolean;
  isZooming: boolean;
  isSelecting: boolean;
  isResetting: boolean;
  activeViewer: number;
}

const StatePanel: React.FC<StatePanelProps> = ({
  isDragging,
  isZooming,
  isSelecting,
  isResetting,
  activeViewer,
}) => {
  return (
    <div className="state-panel">
      <div className="state-header">
        <h3 className="state-title">State Indicators</h3>
        <span className="active-viewer">Active Viewer: {activeViewer}</span>
      </div>
      <div className="canvas-state">
        <div className="state-indicator">
          <ZoomIcon />
          <span>Zooming</span>
          <div className={`indicator-dot ${isZooming ? "active" : ""}`} />
        </div>
        <div className="state-indicator">
          <DragIcon />
          <span>Dragging</span>
          <div className={`indicator-dot ${isDragging ? "active" : ""}`} />
        </div>
        <div className="state-indicator">
          <SelectIcon />
          <span>Selecting</span>
          <div className={`indicator-dot ${isSelecting ? "active" : ""}`} />
        </div>
        <div className="state-indicator">
          <ResetIcon />
          <span>Resetting</span>
          <div className={`indicator-dot ${isResetting ? "active" : ""}`} />
        </div>
      </div>
    </div>
  );
};

export default StatePanel; 