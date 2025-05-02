import React, { useState } from "react";
import "./MultiOptionSwitch.css";

interface MultiOptionSwitchProps {
  options: string[];
  initialSelected?: number;
  onChange?: (selectedIndex: number) => void;
  className?: string;
}

const MultiOptionSwitch: React.FC<MultiOptionSwitchProps> = ({
  options,
  initialSelected = 0,
  onChange,
  className = "",
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialSelected);

  const handleOptionClick = (index: number) => {
    setSelectedIndex(index);
    onChange?.(index);
  };

  return (
    <div className={`multi-option-switch ${className}`}>
      <div className="switch-container">
        {options.map((option, index) => (
          <button
            key={index}
            className={`switch-option ${
              selectedIndex === index ? "selected" : ""
            }`}
            onClick={() => handleOptionClick(index)}>
            {option}
          </button>
        ))}
        <div
          className="switch-indicator"
          style={{
            width: `calc(${100 / options.length}% - 16px)`,
            left: `calc((${(selectedIndex * 100) / options.length}%) + 8px)`,
          }}
        />
      </div>
    </div>
  );
};

export default MultiOptionSwitch;
