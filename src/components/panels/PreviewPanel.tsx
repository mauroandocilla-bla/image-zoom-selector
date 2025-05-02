import React from "react";
import "./PreviewPanel.css";

interface PreviewPanelProps {
  previewUrl: string | null;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ previewUrl }) => {
  return (
    <div className="preview-panel">
      <h3 className="preview-title">Selected Area Preview</h3>
      <div
        id="preview"
        className="preview"
        style={{
          backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};

export default PreviewPanel;
