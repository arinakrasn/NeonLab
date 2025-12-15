import React, { useRef, useEffect, useState, useCallback } from 'react';
import { OpticalElement, ElementType, Vector2 } from '../types';
import { calculateRays } from '../utils/physics';
import { DEFAULT_COLORS } from '../constants';

interface CanvasAreaProps {
  elements: OpticalElement[];
  setElements: React.Dispatch<React.SetStateAction<OpticalElement[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ elements, setElements, selectedId, setSelectedId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Vector2>({ x: 0, y: 0 });

  // Handle Resize
  const [size, setSize] = useState({ w: 0, h: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setSize({
          w: wrapperRef.current.clientWidth,
          h: wrapperRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = size.w;
    canvas.height = size.h;

    // Clear
    ctx.fillStyle = DEFAULT_COLORS.background;
    ctx.fillRect(0, 0, size.w, size.h);

    // Grid (optional, subtle)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, size.h); }
    for (let y = 0; y < size.h; y += 50) { ctx.moveTo(0, y); ctx.lineTo(size.w, y); }
    ctx.stroke();

    // 1. Draw Rays (Behind elements)
    // Add glow effect
    ctx.shadowBlur = 10;
    
    // Calculate Physics
    const raySegments = calculateRays(elements);

    // Draw all segments
    raySegments.forEach(seg => {
      ctx.beginPath();
      ctx.shadowColor = seg.color;
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = 2;
      ctx.moveTo(seg.start.x, seg.start.y);
      ctx.lineTo(seg.end.x, seg.end.y);
      ctx.stroke();
    });

    // Reset shadow for elements
    ctx.shadowBlur = 0;

    // 2. Draw Elements
    elements.forEach(el => {
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);

      const isSelected = el.id === selectedId;
      ctx.strokeStyle = isSelected ? DEFAULT_COLORS.highlight : DEFAULT_COLORS.elementStroke;
      ctx.fillStyle = DEFAULT_COLORS.elementFill;
      ctx.lineWidth = isSelected ? 3 : 2;

      if (el.type === ElementType.ConvexLens) {
         // Draw Lens Shape (Vesica Piscis approx)
         ctx.beginPath();
         ctx.ellipse(0, 0, el.width / 6, el.width / 2, 0, 0, 2 * Math.PI);
         ctx.fill();
         ctx.stroke();
         // Axis mark
         ctx.beginPath();
         ctx.strokeStyle = '#64748b';
         ctx.lineWidth = 1;
         ctx.moveTo(0, -el.width/2);
         ctx.lineTo(0, el.width/2);
         ctx.stroke();
      } else if (el.type === ElementType.ConcaveLens) {
        // Hourglass shape
        const w = el.width / 6;
        const h = el.width / 2;
        ctx.beginPath();
        ctx.moveTo(-w, -h);
        ctx.quadraticCurveTo(w/2, 0, -w, h);
        ctx.lineTo(w, h);
        ctx.quadraticCurveTo(-w/2, 0, w, -h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (el.type === ElementType.Mirror) {
        // Flat line with hash marks on back
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#94a3b8'; // Silver
        ctx.moveTo(0, -el.width / 2);
        ctx.lineTo(0, el.width / 2);
        ctx.stroke();
        
        // Back markings
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#475569';
        for(let i = -el.width/2; i < el.width/2; i+= 10) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(-10, i + 5);
            ctx.stroke();
        }
      } else if (el.type === ElementType.Blocker) {
        // Solid Block
        ctx.fillStyle = '#334155';
        ctx.fillRect(-10, -el.width/2, 20, el.width);
        ctx.strokeRect(-10, -el.width/2, 20, el.width);
        
        // Absorption Hatching
        ctx.save();
        ctx.beginPath();
        ctx.rect(-10, -el.width/2, 20, el.width);
        ctx.clip();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        for(let i = -el.width/2 - 20; i < el.width/2 + 20; i+=8) {
            ctx.moveTo(-20, i);
            ctx.lineTo(20, i+20);
        }
        ctx.stroke();
        ctx.restore();

      } else if ([ElementType.RaySource, ElementType.BeamSource, ElementType.PointSource].includes(el.type)) {
        // Source Body
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Emitter indicator
        ctx.fillStyle = el.color || DEFAULT_COLORS.ray;
        ctx.beginPath();
        ctx.arc(10, 0, 4, 0, Math.PI * 2); // 'Front' of the source (rotated)
        ctx.fill();
      }

      ctx.restore();
    });

  }, [elements, size, selectedId]);

  // Event Handlers
  const getMousePos = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    // Find clicked element (simple distance check, could be better with OBB)
    const clickedEl = elements.slice().reverse().find(el => {
      const dist = Math.sqrt(Math.pow(el.x - pos.x, 2) + Math.pow(el.y - pos.y, 2));
      return dist < 30; // Radius tolerance
    });

    if (clickedEl) {
      setSelectedId(clickedEl.id);
      setIsDragging(true);
      setDragOffset({ x: pos.x - clickedEl.x, y: pos.y - clickedEl.y });
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedId) {
      const pos = getMousePos(e);
      setElements(prev => prev.map(el => {
        if (el.id === selectedId) {
          return { ...el, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y };
        }
        return el;
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('elementType') as ElementType;
      if (!type) return;

      const pos = getMousePos(e);
      const newEl: OpticalElement = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          x: pos.x,
          y: pos.y,
          rotation: type === ElementType.Mirror ? 90 : 0, // Default mirrors to vertical
          width: 100,
          focalLength: 150,
          rayCount: type === ElementType.BeamSource ? 3 : 1,
          spread: type === ElementType.BeamSource ? 20 : 45,
          color: '#22d3ee'
      };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
  }

  return (
    <div 
        ref={wrapperRef} 
        className="w-full h-full relative cursor-crosshair overflow-hidden"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="block"
      />
    </div>
  );
};

export default CanvasArea;