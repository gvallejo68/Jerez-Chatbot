import React from 'react';
import { AgentType, ToneType } from '../types';

interface SettingsPanelProps {
  currentAgent: AgentType;
  currentTone: ToneType;
  onAgentChange: (agent: AgentType) => void;
  onToneChange: (tone: ToneType) => void;
  onClearChat: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  currentAgent,
  currentTone,
  onAgentChange,
  onToneChange,
  onClearChat,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex flex-col gap-4 shadow-sm z-10 relative">
      
      {/* Header / Branding */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md transition-colors duration-300 ${currentAgent === AgentType.EMERGENCY ? 'bg-red-600' : 'bg-sherry-700'}`}>
          {currentAgent === AgentType.EMERGENCY ? 'SOS' : 'J'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {currentAgent === AgentType.EMERGENCY ? 'Jerez SOS' : 'Jerez Explore'}
          </h1>
          <p className="text-xs text-gray-500">
            {currentAgent === AgentType.EMERGENCY ? 'Asistencia de Emergencia' : 'Guía Turístico Virtual'}
          </p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        
        {/* Agent Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => onAgentChange(AgentType.TOURIST)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentAgent === AgentType.TOURIST
                ? 'bg-white text-sherry-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Turismo
          </button>
          <button
            onClick={() => onAgentChange(AgentType.EMERGENCY)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentAgent === AgentType.EMERGENCY
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Emergencias
          </button>
        </div>

        {/* Tone Selector (Only visible for Tourist) */}
        {currentAgent === AgentType.TOURIST && (
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">Tono:</span>
            {Object.values(ToneType).map((tone) => (
              <button
                key={tone}
                onClick={() => onToneChange(tone)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors whitespace-nowrap ${
                  currentTone === tone
                    ? 'bg-sherry-100 border-sherry-200 text-sherry-800 font-medium'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tone === ToneType.FORMAL ? 'Formal' : tone === ToneType.COLLOQUIAL ? 'Coloquial' : 'Entusiasta'}
              </button>
            ))}
          </div>
        )}

        {/* Clear Button */}
        <button 
          onClick={onClearChat}
          className="text-xs text-gray-400 hover:text-red-500 underline ml-auto sm:ml-0"
        >
          Borrar Chat
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;