import { Vector2 } from "../types";

export const degToRad = (deg: number) => (deg * Math.PI) / 180;
export const radToDeg = (rad: number) => (rad * 180) / Math.PI;

export const rotateVector = (v: Vector2, angleRad: number): Vector2 => {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
};

export const addVectors = (v1: Vector2, v2: Vector2): Vector2 => ({ x: v1.x + v2.x, y: v1.y + v2.y });
export const subVectors = (v1: Vector2, v2: Vector2): Vector2 => ({ x: v1.x - v2.x, y: v1.y - v2.y });
export const multiplyVector = (v: Vector2, s: number): Vector2 => ({ x: v.x * s, y: v.y * s });
export const dotProduct = (v1: Vector2, v2: Vector2): number => v1.x * v2.x + v1.y * v2.y;
export const normalizeVector = (v: Vector2): Vector2 => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
};

export const distance = (v1: Vector2, v2: Vector2): number => {
  const dx = v1.x - v2.x;
  const dy = v1.y - v2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Line segment intersection
// p: ray origin, r: ray direction
// q: segment start, s: segment direction (end - start)
export const getRaySegmentIntersection = (
  px: number, py: number, dx: number, dy: number,
  sx1: number, sy1: number, sx2: number, sy2: number
): { t: number; point: Vector2 } | null => {
  const r = { x: dx, y: dy };
  const s = { x: sx2 - sx1, y: sy2 - sy1 };
  const q = { x: sx1, y: sy1 };
  const p = { x: px, y: py };

  const rxs = r.x * s.y - r.y * s.x;
  const qpx = q.x - p.x;
  const qpy = q.y - p.y;
  const qpxr = qpx * r.y - qpy * r.x;

  // Parallel
  if (Math.abs(rxs) < 1e-5) return null;

  const t = (qpx * s.y - qpy * s.x) / rxs;
  const u = qpxr / rxs;

  // t > epsilon (ray moves forward), 0 <= u <= 1 (segment bounds)
  if (t > 1e-3 && u >= 0 && u <= 1) {
    return {
      t: t,
      point: {
        x: p.x + t * r.x,
        y: p.y + t * r.y
      }
    };
  }
  return null;
};
