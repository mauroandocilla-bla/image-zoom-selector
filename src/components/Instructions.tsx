import React from "react";
import "./Instructions.css";

interface InstructionsProps {
  previewUrl: string | null;
}

const Instructions: React.FC<InstructionsProps> = ({ previewUrl }) => {
  return (
    <div className="instructions-container">
      <div className="instructions-section">
        <h3>Instructions</h3>
        <ul>
          <li>Use mouse wheel to zoom in/out</li>
          <li>Click and drag to move the image</li>
          <li>Hold Shift key and drag to select an area</li>
          <li>Double click to reset the view</li>
        </ul>
      </div>
      
      <div className="selection-info">
        <h3>Selection Result</h3>
        <p>When you select an area of the image, the selected portion will be displayed in the preview panel on the left side of the screen. You can then use this selection for further processing or analysis.</p>
      </div>
    </div>
  );
};

export default Instructions; 