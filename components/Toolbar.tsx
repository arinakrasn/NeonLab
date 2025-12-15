import React from 'react';
import { ElementType } from '../types';
import { Lightbulb, ScanLine, Minus, Circle, SquareSlash } from 'lucide-react';

interface ToolbarProps {
  onDragStart: (type: ElementType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onDragStart }) => {
  const tools = [
    { type: ElementType.BeamSource, label: 'Ray Box', icon: <ScanLine className="w-6 h-6" /> },
    { type: ElementType.PointSource, label: 'Point Source', icon: <Lightbulb className="w-6 h-6" /> },
    { type: ElementType.ConvexLens, label: 'Convex Lens', icon: <Circle className="w-6 h-6 fill-current text-cyan-500/20" /> },
    { type: ElementType.ConcaveLens, label: 'Concave Lens', icon: <div className="w-6 h-6 border-x-2 border-cyan-400 rounded-full" /> }, 
    { type: ElementType.Mirror, label: 'Plane Mirror', icon: <Minus className="w-6 h-6 rotate-90" /> },
    { type: ElementType.Blocker, label: 'Blocker', icon: <SquareSlash className="w-6 h-6" /> },
  ];

  return (
    <div className="absolute left-4 top-4 bottom-4 w-16 md:w-20 bg-slate-900/90 border-r border-slate-700/50 backdrop-blur-md flex flex-col items-center py-6 gap-6 rounded-2xl shadow-2xl z-20">
      <div className="text-cyan-400 font-bold text-xs tracking-widest mb-2 rotate-180 md:rotate-0 writing-vertical md:writing-horizontal">TOOLS</div>
      {tools.map((tool) => (
        <div
          key={tool.type}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('elementType', tool.type);
            onDragStart(tool.type);
          }}
          className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-110 transition-all cursor-grab active:cursor-grabbing text-slate-300 hover:text-cyan-400"
          title={tool.label}
        >
          {tool.icon}
          <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-cyan-400 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity border border-slate-700 z-50">
            {tool.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Toolbar;