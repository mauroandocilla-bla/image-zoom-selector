import React from "react";
import "./Instructions.css";

interface InstructionsProps {
  uxBehavior: number;
}

interface InstructionSet {
  title: string;
  steps: string[];
  resultTitle: string;
  resultDescription: string;
}

const INSTRUCTION_SETS: InstructionSet[] = [
  {
    title: "Instructions",
    steps: [
      "Use mouse wheel to zoom in/out.",
      "Click and drag to move the image.",
      "Hold the Shift key and drag to select an area to zoom in – the selected area will be displayed in the preview panel.",
      "Double-click to reset the view.",
    ],
    resultTitle: "Selection Result",
    resultDescription:
      "When you select an area of the image, the selected portion will appear in the preview panel on the left side of the screen. You can then use this selection for further processing or analysis.",
  },
  {
    title: "Instructions",
    steps: [
      "Click and drag to zoom into a selected area.",
      "Press the ‘C’ key to activate crop mode.",
      "In crop mode, click and drag to select the license plate — the cropped area will be displayed in the preview panel.",
      "Double-click to reset the view.",
    ],
    resultTitle: "Crop Result",
    resultDescription:
      "When you crop an area of the image, the cropped portion will appear in the preview panel on the left side of the screen. You can then use this cropped image for further processing or analysis.",
  },
];

const Instructions: React.FC<InstructionsProps> = ({ uxBehavior }) => {
  const content = INSTRUCTION_SETS[uxBehavior];

  if (!content) return null;

  return (
    <div className="instructions-container">
      <div className="instructions-section">
        <h3>{content.title}</h3>
        <ul>
          {content.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>

      <div className="selection-info">
        <h3>{content.resultTitle}</h3>
        <p>{content.resultDescription}</p>
      </div>
    </div>
  );
};

export default Instructions;
