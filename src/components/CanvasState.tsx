import React from "react";
import "./CanvasState.css";

interface CanvasStateProps {
  isDragging: boolean;
}

const CanvasState: React.FC<CanvasStateProps> = ({ isDragging }) => {
  return (
    <div className="canvas-state">
      <div className="state-indicator">
        <div className={`indicator-dot ${isDragging ? "dragging" : ""}`} />
        <span>Estado: {isDragging ? "Arrastrando" : "Inactivo"}</span>
      </div>
    </div>
  );
};

export default CanvasState; 