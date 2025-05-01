import React from 'react';
import './Tooltip.css';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip">
        <div className="tooltip-arrow" />
        <div className="tooltip-content">{content}</div>
      </div>
    </div>
  );
};

export default Tooltip; 