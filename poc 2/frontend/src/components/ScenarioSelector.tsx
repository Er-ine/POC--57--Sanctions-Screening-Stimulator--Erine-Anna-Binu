import { Activity, Clock, Moon, GitBranch } from 'lucide-react';
import { useState } from 'react';

interface ScenarioSelectorProps {
  scenarios: any[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ScenarioSelector({ scenarios, activeId, onSelect }: ScenarioSelectorProps) {
  const [clickedId, setClickedId] = useState<string | null>(null);

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 rounded animate-shimmer"></div>
        ))}
      </div>
    );
  }

  const getIcon = (id: string) => {
    switch (id) {
      case 'full_network': return <Activity size={14} className="opacity-80" />;
      case 'peak_hours': return <Clock size={14} className="opacity-80" />;
      case 'weekend': return <Moon size={14} className="opacity-80" />;
      case 'reroute': return <GitBranch size={14} className="opacity-80" />;
      default: return <Activity size={14} className="opacity-80" />;
    }
  };

  const handleSelect = (id: string) => {
    setClickedId(id);
    setTimeout(() => setClickedId(null), 200);
    onSelect(id);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {scenarios.map((scenario) => {
        const isActive = activeId === scenario.id;
        const isClicked = clickedId === scenario.id;
        
        return (
          <button
            key={scenario.id}
            onClick={() => handleSelect(scenario.id)}
            style={{ transform: isClicked ? 'scale(0.97)' : isActive ? 'scale(1)' : undefined }}
            className={`
              relative p-3 rounded-lg text-left transition-all duration-200 overflow-hidden
              ${isActive ? 'bg-cyan/10 cyan-border-glow gradient-border' : 'glassmorphism hover:bg-slate-800/80 hover:-translate-y-[1px]'}
            `}
          >
            {isActive && (
              <div className="absolute top-2 right-2 text-cyan">
                <Activity size={12} className="pulse-ring" />
              </div>
            )}
            <div className={`font-semibold text-xs mb-1 flex items-center gap-1.5 ${isActive ? 'text-cyan' : 'text-gray-300'}`}>
              {getIcon(scenario.id)}
              {scenario.name}
            </div>
            <div className="text-[10px] text-gray-500 leading-tight">
              {scenario.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
