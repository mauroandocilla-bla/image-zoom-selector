import React, { useState } from "react";
import "./styles.css";
import KonvaViewer from "./components/KonvaViewer";
import CanvasState from "./components/CanvasState";

const IMAGE_URL =
  "https://fastly.picsum.photos/id/45/4592/2576.jpg?hmac=Vc7_kMYufvy96FxocZ1Zx6DR1PNsNQXF4XUw1mZ2dlc";

const App = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSelectionBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div
          id="preview"
          className="preview"
          style={{
            backgroundImage: previewUrl
              ? `url(${previewUrl})`
              : `url(${IMAGE_URL})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />
        <CanvasState isDragging={isDragging} />
      </div>

      <div className="content-wrapper">
        <div className="grid-container">
          <KonvaViewer
            imageUrl={IMAGE_URL}
            onDragStateChange={setIsDragging}
            onSelectionBlob={handleSelectionBlob}
          />
          <KonvaViewer
            imageUrl={IMAGE_URL}
            onDragStateChange={setIsDragging}
            onSelectionBlob={handleSelectionBlob}
          />
          <KonvaViewer
            imageUrl={IMAGE_URL}
            onDragStateChange={setIsDragging}
            onSelectionBlob={handleSelectionBlob}
          />
          <KonvaViewer
            imageUrl={IMAGE_URL}
            onDragStateChange={setIsDragging}
            onSelectionBlob={handleSelectionBlob}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
