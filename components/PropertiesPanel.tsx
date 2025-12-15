import React from 'react';
import { OpticalElement, ElementType } from '../types';
import { Trash2, RotateCw, MoveHorizontal, Maximize2, Sun, Ruler } from 'lucide-react';

interface PropertiesPanelProps {
  element: OpticalElement | null;
  onChange: (id: string, changes: Partial<OpticalElement>) => void;
  onDelete: (id: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onChange, onDelete }) => {
  if (!element) return null;

  const handleChange = (key: keyof OpticalElement, value: any) => {
    onChange(element.id, { [key]: value });
  };

  // Check if it's a type that supports width resizing (Mirrors, Lenses, Blockers, and now BeamSource/RayBox)
  const supportsWidth = [
      ElementType.ConvexLens, 
      ElementType.ConcaveLens, 
      ElementType.Mirror, 
      ElementType.Blocker,
      ElementType.BeamSource
  ].includes(element.type);

  // Check if it's a point source (width doesn't apply to a mathematical point in this sim)
  const isPointSource = element.type === ElementType.PointSource;

  return (
    <div className="absolute right-4 top-4 w-64 bg-slate-900/90 border border-slate-700/50 backdrop-blur-md p-4 rounded-2xl shadow-2xl z-20 text-slate-200 animate-fade-in-right">
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-sm">Properties</h3>
        <button 
            onClick={() => onDelete(element.id)}
            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
        >
            <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Common: Rotation */}
        <div className="space-y-1">
          <label className="text-xs text-slate-500 flex items-center gap-2">
            <RotateCw size={12} /> Rotation ({Math.round(element.rotation)}°)
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={element.rotation}
            onChange={(e) => handleChange('rotation', Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Common: Size (Width) */}
        {supportsWidth && (
           <div className="space-y-1">
           <label className="text-xs text-slate-500 flex items-center gap-2">
             <Ruler size={12} /> Size ({Math.round(element.width)})
           </label>
           <input
             type="range"
             min="20"
             max="400"
             value={element.width}
             onChange={(e) => handleChange('width', Number(e.target.value))}
             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
           />
         </div>
        )}

        {/* Lenses: Focal Length */}
        {(element.type === ElementType.ConvexLens || element.type === ElementType.ConcaveLens) && (
          <div className="space-y-1">
            <label className="text-xs text-slate-500 flex items-center gap-2">
              <Maximize2 size={12} /> Focal Length ({element.focalLength})
            </label>
            <input
              type="range"
              min="10"
              max="500"
              value={element.focalLength}
              onChange={(e) => handleChange('focalLength', Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        )}

        {/* Point Source: Spread Angle */}
        {isPointSource && (
           <div className="space-y-1">
           <label className="text-xs text-slate-500 flex items-center gap-2">
             <MoveHorizontal size={12} /> Spread Angle
           </label>
           <input
             type="range"
             min="10"
             max="360"
             value={element.spread}
             onChange={(e) => handleChange('spread', Number(e.target.value))}
             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
           />
         </div>
        )}

        {/* Sources: Ray Count */}
        {(element.type === ElementType.BeamSource || element.type === ElementType.PointSource) && (
           <div className="space-y-1">
           <label className="text-xs text-slate-500 flex items-center gap-2">
             <Sun size={12} /> Ray Count ({element.rayCount})
           </label>
           <input
             type="range"
             min="1"
             max="20"
             step="1"
             value={element.rayCount}
             onChange={(e) => handleChange('rayCount', Number(e.target.value))}
             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
           />
         </div>
        )}
        
         {/* Sources: Color */}
         {(element.type === ElementType.BeamSource || element.type === ElementType.PointSource || element.type === ElementType.RaySource) && (
           <div className="space-y-1 pt-2 border-t border-slate-800">
           <label className="text-xs text-slate-500 flex items-center gap-2">
             Color
           </label>
           <div className="flex gap-2">
              {['#22d3ee', '#facc15', '#f87171', '#4ade80', '#e879f9', '#ffffff'].map(c => (
                  <button
                    key={c}
                    onClick={() => handleChange('color', c)}
                    className={`w-6 h-6 rounded-full border border-slate-600 ${element.color === c ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{backgroundColor: c}}
                  />
              ))}
           </div>
         </div>
        )}

      </div>
    </div>
  );
};

export default PropertiesPanel;