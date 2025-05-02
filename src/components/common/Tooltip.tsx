import React from 'react';
import './Tooltip.css';

type TooltipPosition = 'left' | 'right' | 'center';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: TooltipPosition;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'center' }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className={`tooltip tooltip-${position}`}>{content}</div>
      <div className="tooltip-arrow" />
    </div>
  );
};

export default Tooltip;