import React from 'react';
import './ScenarioSelector.scss';

export interface Scenario {
  id: string;
  title: string;
  description: string;
}

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenarioId: string | null;
  onSelect: (scenarioId: string) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedScenarioId,
  onSelect,
}) => {
  return (
    <div className="scenario-selector">
      <h3>Choose a Scenario</h3>
      <div className="scenario-list">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`scenario-item${selectedScenarioId === scenario.id ? ' selected' : ''}`}
            onClick={() => onSelect(scenario.id)}
          >
            <div className="scenario-title">{scenario.title}</div>
            <div className="scenario-description">{scenario.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
