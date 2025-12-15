import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import CanvasArea from './components/CanvasArea';
import PropertiesPanel from './components/PropertiesPanel';
import { OpticalElement, ElementType } from './types';
import { INITIAL_ELEMENTS } from './constants';
import { Beaker } from 'lucide-react';

const App: React.FC = () => {
  const [elements, setElements] = useState<OpticalElement[]>(INITIAL_ELEMENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedElement = elements.find(el => el.id === selectedId) || null;

  const handlePropertyChange = (id: string, changes: Partial<OpticalElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el));
  };
  
  const handleDelete = (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      setSelectedId(null);
  };

  const handleReset = () => {
      // Create a shallow copy of the objects to ensure state is fresh and doesn't mutate constants
      setElements(INITIAL_ELEMENTS.map(el => ({ ...el })));
      setSelectedId(null);
  }

  return (
    <div className="flex w-screen h-screen bg-slate-900 text-white overflow-hidden font-sans select-none">
      {/* Header / Title */}
      <div className="absolute top-4 left-24 z-10 pointer-events-none opacity-80">
        <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          NEON <span className="text-white not-italic font-light">LAB</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
             <Beaker size={12} /> Virtual Optical Laboratory
        </p>
      </div>
      
      {/* Clear Button */}
      <button 
        onClick={handleReset}
        className="absolute top-4 left-60 z-30 px-3 py-1 bg-slate-800 text-xs text-slate-400 hover:text-white rounded border border-slate-700 hover:border-red-500 transition-colors cursor-pointer"
      >
          Reset Lab
      </button>

      {/* Sidebar */}
      <Toolbar onDragStart={() => {}} />

      {/* Main Canvas */}
      <main className="flex-1 relative">
        <CanvasArea
          elements={elements}
          setElements={setElements}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      </main>

      {/* Properties Panel */}
      <PropertiesPanel 
        element={selectedElement} 
        onChange={handlePropertyChange}
        onDelete={handleDelete}
      />
      
      {/* Hint */}
      <div className="absolute bottom-4 right-4 text-slate-600 text-xs pointer-events-none">
        v1.1 • Drag & Drop Elements • Geometric Optics Sim
      </div>
    </div>
  );
};

export default App;