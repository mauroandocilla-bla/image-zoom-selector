import React, { useState } from "react";
import "./styles.css";
import KonvaViewer from "./components/KonvaViewer";
import StatePanel from "./components/StatePanel";
import Instructions from "./components/Instructions";
import PreviewPanel from "./components/PreviewPanel";

const IMAGE_URL =
  "https://fastly.picsum.photos/id/45/4592/2576.jpg?hmac=Vc7_kMYufvy96FxocZ1Zx6DR1PNsNQXF4XUw1mZ2dlc";

const App = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeViewer, setActiveViewer] = useState(1);

  const handleSelectionBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <PreviewPanel 
          previewUrl={previewUrl}
          defaultImageUrl={IMAGE_URL}
        />
        <StatePanel 
          isDragging={isDragging}
          isZooming={isZooming}
          isSelecting={isSelecting}
          isResetting={isResetting}
          activeViewer={activeViewer}
        />
        <Instructions previewUrl={previewUrl} />
      </div>

      <div className="content-wrapper">
        <div className="grid-container">
          <KonvaViewer
            imageUrl={IMAGE_URL}
            onDragStateChange={setIsDragging}
            onZoomStateChange={setIsZooming}
            onSelectStateChange={setIsSelecting}
            onResetStateChange={setIsResetting}
            onSelectionBlob={handleSelectionBlob}
          />
          <KonvaViewer
            imageUrl={IMAGE_URL}
            onDragStateChange={setIsDragging}
            onZoomStateChange={setIsZooming}
            onSelectStateChange={setIsSelecting}
            onResetStateChange={setIsResetting}
            onSelectionBlob={handleSelectionBlob}
          />
          <KonvaViewer
            imageUrl={IMAGE_URL}
            onDragStateChange={setIsDragging}
            onZoomStateChange={setIsZooming}
            onSelectStateChange={setIsSelecting}
            onResetStateChange={setIsResetting}
            onSelectionBlob={handleSelectionBlob}
          />
          <KonvaViewer
            imageUrl={IMAGE_URL}
            onDragStateChange={setIsDragging}
            onZoomStateChange={setIsZooming}
            onSelectStateChange={setIsSelecting}
            onResetStateChange={setIsResetting}
            onSelectionBlob={handleSelectionBlob}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
