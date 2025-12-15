import { ElementType, OpticalElement } from "./types";

export const MAX_BOUNCES = 50;
export const CANVAS_WIDTH = 2000; // Virtual width
export const CANVAS_HEIGHT = 2000; // Virtual height

export const DEFAULT_COLORS = {
  ray: '#22d3ee', // Cyan-400
  raySecondary: '#facc15', // Yellow-400
  background: '#0f172a', // Slate-900
  elementStroke: '#e2e8f0', // Slate-200
  elementFill: '#1e293b', // Slate-800
  highlight: '#a5f3fc', // Cyan-200
};

export const INITIAL_ELEMENTS: OpticalElement[] = [
  {
    id: 'source-1',
    type: ElementType.BeamSource,
    x: 150,
    y: 300,
    rotation: 0,
    width: 60, // Physical width of the ray box
    rayCount: 3,
    spread: 0, // Not used for beam source width anymore
    color: '#22d3ee'
  },
  {
    id: 'lens-1',
    type: ElementType.ConvexLens,
    x: 400,
    y: 300,
    rotation: 90,
    width: 120,
    focalLength: 150
  }
];