
import React from 'react';

interface HolographicPanelProps {
  children: React.ReactNode;
  className?: string;
}

const HolographicPanel: React.FC<HolographicPanelProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`bg-cyan-900/10 backdrop-blur-md border border-cyan-400/30 rounded-lg shadow-lg shadow-cyan-500/10 p-4 md:p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default HolographicPanel;
