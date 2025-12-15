export enum ElementType {
  RaySource = 'SOURCE',
  BeamSource = 'BEAM', // Parallel rays
  PointSource = 'POINT', // Omnidirectional-ish
  ConvexLens = 'CONVEX_LENS',
  ConcaveLens = 'CONCAVE_LENS',
  Mirror = 'MIRROR',
  Blocker = 'BLOCKER'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface OpticalElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number; // in degrees
  width: number; // For lenses/mirrors: length of the element
  focalLength?: number; // For lenses
  rayCount?: number; // For sources
  spread?: number; // For sources (spread angle)
  color?: string; // For ray color
}

export interface Ray {
  start: Vector2;
  direction: Vector2;
  intensity: number;
  color: string;
}

export interface Intersection {
  point: Vector2;
  distance: number;
  elementId: string;
}
