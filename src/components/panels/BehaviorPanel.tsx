import React from 'react';
import MultiOptionSwitch from '../common/MultiOptionSwitch';
import './BehaviorPanel.css';

interface BehaviorPanelProps {
  selectedOption: number;
  onOptionChange: (index: number) => void;
}

const BehaviorPanel: React.FC<BehaviorPanelProps> = ({
  selectedOption,
  onOptionChange,
}) => {
  return (
    <div className="behavior-panel">
      <h3 className="panel-title">Behavior</h3>
      <div className="panel-content">
        <MultiOptionSwitch
          options={["1", "2"]}
          initialSelected={selectedOption}
          onChange={onOptionChange}
        />
      </div>
    </div>
  );
};

export default BehaviorPanel; 