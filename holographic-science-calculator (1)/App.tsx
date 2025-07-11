
import React, { useState, useCallback } from 'react';
import { Mode } from './types';
import HolographicPanel from './components/HolographicPanel';
import GeminiAssistant from './components/GeminiAssistant';
import { ChemistryIcon, PhysicsIcon, MathIcon } from './components/Icons';

// Sub-components for different labs
const LabButton: React.FC<{
  label: string;
  Icon: React.FC<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  color: string;
}> = ({ label, Icon, isActive, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-md transition-all duration-300 border ${
      isActive
        ? `bg-${color}-500/30 border-${color}-400 shadow-lg shadow-${color}-500/20`
        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
    }`}
  >
    <Icon className={`w-8 h-8 ${isActive ? `text-${color}-300` : 'text-slate-400'}`} />
    <span className={`font-bold ${isActive ? `text-${color}-200` : 'text-slate-300'}`}>{label}</span>
  </button>
);

const LabInterface: React.FC<{ mode: Mode; setAssistantPrompt: (prompt: string) => void }> = ({ mode, setAssistantPrompt }) => {
  const [inputValue, setInputValue] = useState('');

  const getToolDetails = () => {
    switch (mode) {
      case Mode.CHEMISTRY:
        return {
          title: "Химическая Лаборатория",
          toolLabel: "Балансировщик уравнений",
          placeholder: "Напр., H2 + O2 -> H2O",
          promptPrefix: "Сбалансируй это химическое уравнение: ",
          color: "fuchsia"
        };
      case Mode.PHYSICS:
        return {
          title: "Физическая Симуляция",
          toolLabel: "Конвертер Единиц",
          placeholder: "Напр., 100 км/ч в м/с",
          promptPrefix: "Конвертируй это значение: ",
          color: "amber"
        };
      case Mode.ADVANCED_MATH:
        return {
          title: "Математический Анализ",
          toolLabel: "Решатель Уравнений",
          placeholder: "Напр., x^2 - 4 = 0",
          promptPrefix: "Реши это уравнение: ",
          color: "lime"
        };
      default:
        return { title: '', toolLabel: '', placeholder: '', promptPrefix: '', color: 'gray' };
    }
  };

  const { title, toolLabel, placeholder, promptPrefix, color } = getToolDetails();

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setAssistantPrompt(promptPrefix + inputValue);
    setInputValue('');
  };

  return (
    <div className={`p-4 border-t-2 border-${color}-500/50`}>
        <h3 className={`text-lg font-bold text-${color}-300 mb-4`}>{toolLabel}</h3>
        <div className="flex flex-col sm:flex-row gap-2">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="flex-grow bg-slate-900/70 border border-slate-600 rounded-md p-2 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
                onClick={handleSubmit}
                className={`px-4 py-2 bg-${color}-500/80 hover:bg-${color}-500 text-white font-bold rounded-md transition-all duration-200 shadow-md shadow-${color}-500/30`}
            >
                Вычислить
            </button>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.CHEMISTRY);
  const [assistantPrompt, setAssistantPrompt] = useState<string>('');

  const handleSetPrompt = useCallback((prompt: string) => {
    setAssistantPrompt(''); // Clear previous prompt first
    setTimeout(() => setAssistantPrompt(prompt), 0); // Set new prompt
  }, []);

  // Preload Tailwind JIT colors
  const safeColors = "bg-fuchsia-500/30 border-fuchsia-400 shadow-fuchsia-500/20 text-fuchsia-300 text-fuchsia-200 bg-fuchsia-500/80 hover:bg-fuchsia-500 shadow-fuchsia-500/30 border-fuchsia-500/50 " +
                     "bg-amber-500/30 border-amber-400 shadow-amber-500/20 text-amber-300 text-amber-200 bg-amber-500/80 hover:bg-amber-500 shadow-amber-500/30 border-amber-500/50 " +
                     "bg-lime-500/30 border-lime-400 shadow-lime-500/20 text-lime-300 text-lime-200 bg-lime-500/80 hover:bg-lime-500 shadow-lime-500/30 border-lime-500/50";


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8" style={{ colorScheme: 'dark' }}>
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="flex flex-col gap-8">
            <HolographicPanel>
                <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 text-center mb-4">ГОЛОГРАФИЧЕСКИЙ КАЛЬКУЛЯТОР</h1>
                <div className="flex flex-col sm:flex-row gap-4">
                    <LabButton label="Химия" Icon={ChemistryIcon} isActive={mode === Mode.CHEMISTRY} onClick={() => setMode(Mode.CHEMISTRY)} color="fuchsia" />
                    <LabButton label="Физика" Icon={PhysicsIcon} isActive={mode === Mode.PHYSICS} onClick={() => setMode(Mode.PHYSICS)} color="amber" />
                    <LabButton label="Математика" Icon={MathIcon} isActive={mode === Mode.ADVANCED_MATH} onClick={() => setMode(Mode.ADVANCED_MATH)} color="lime" />
                </div>
            </HolographicPanel>
            <HolographicPanel>
                <LabInterface mode={mode} setAssistantPrompt={handleSetPrompt} />
            </HolographicPanel>
        </div>
        <div className="h-[80vh] lg:h-auto">
            <GeminiAssistant key={assistantPrompt} initialPrompt={assistantPrompt} />
        </div>
      </main>
    </div>
  );
}

export default App;
