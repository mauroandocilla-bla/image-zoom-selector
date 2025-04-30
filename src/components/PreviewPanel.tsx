import React from "react";
import "./PreviewPanel.css";

interface PreviewPanelProps {
  previewUrl: string | null;
  defaultImageUrl: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ previewUrl, defaultImageUrl }) => {
  return (
    <div className="preview-panel">
      <h3 className="preview-title">Selected Area Preview</h3>
      <div
        id="preview"
        className="preview"
        style={{
          backgroundImage: previewUrl
            ? `url(${previewUrl})`
            : `url(${defaultImageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};

export default PreviewPanel; 