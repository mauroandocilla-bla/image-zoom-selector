import React from "react";
import "./Instructions.css";

interface InstructionsProps {
  uxBehavior: number;
}

const Instructions: React.FC<InstructionsProps> = ({ uxBehavior }) => {
  return (
    <div className="instructions-container">
      <div className="instructions-section">
        <h3>Instructions</h3>
        <ul>
          {uxBehavior === 0 && (
            <>
              <li>Use mouse wheel to zoom in/out</li>
              <li>Click and drag to move the image</li>
              <li>
                Hold Shift key and drag to select an area to zoom in - the
                selected area will be displayed in the preview panel.
              </li>
              <li>Double click to reset the view</li>
            </>
          )}
          {uxBehavior === 1 && (
            <>
              <li>Click and drag to zoom into a selected area.</li>
              <li>Press the ‘C’ key to activate crop mode.</li>
              <li>
                In crop mode, click and drag to select the license plate — the
                cropped area will be displayed in the preview panel.
              </li>
              <li>Double click to reset the view</li>
            </>
          )}
        </ul>
      </div>

      <div className="selection-info">
        {uxBehavior === 0 && (
          <>
            <h3>Selection Result</h3>
            <p>
              When you select an area of the image, the selected portion will be
              displayed in the preview panel on the left side of the screen. You
              can then use this selection for further processing or analysis.
            </p>
          </>
        )}
        {uxBehavior === 1 && (
          <>
            <h3>Crop Result</h3>
            <p>
              When you crop an area of the image, the cropped portion will be
              displayed in the preview panel on the left side of the screen. You
              can then use this cropped image for further processing or
              analysis.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Instructions;
