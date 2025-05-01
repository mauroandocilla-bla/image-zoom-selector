import React, { useState } from "react";
import "./styles.css";
import KonvaViewer from "./components/viewer/KonvaViewer";
import StatePanel from "./components/panels/StatePanel";
import Instructions from "./components/instructions/Instructions";
import PreviewPanel from "./components/panels/PreviewPanel";

const IMAGE_URL_1 =
  "https://res.cloudinary.com/dzn9djhjp/image/upload/v1746049698/1_icb054.jpg";
const IMAGE_URL_2 =
  "https://res.cloudinary.com/dzn9djhjp/image/upload/v1746049682/3_gj0v8m.jpg";
const IMAGE_URL_3 =
  "https://res.cloudinary.com/dzn9djhjp/image/upload/v1746049685/4_hxekyn.jpg";
const IMAGE_URL_4 =
  "https://res.cloudinary.com/dzn9djhjp/image/upload/v1746049687/2_jnj97a.jpg";

const IMAGE_URLS = [IMAGE_URL_1, IMAGE_URL_2, IMAGE_URL_3, IMAGE_URL_4];

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
        <PreviewPanel previewUrl={previewUrl} defaultImageUrl={IMAGE_URL_1} />
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
          {IMAGE_URLS.map((imageUrl, index) => (
            <KonvaViewer
              key={index}
                imageUrl={imageUrl}
                onDragStateChange={setIsDragging}
                onZoomStateChange={setIsZooming}
                onSelectStateChange={setIsSelecting}
                onResetStateChange={setIsResetting}
                onSelectionBlob={handleSelectionBlob}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
