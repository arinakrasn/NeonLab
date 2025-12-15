import { OpticalElement, ElementType, Ray, Vector2 } from "../types";
import { degToRad, getRaySegmentIntersection, normalizeVector, rotateVector, distance, subVectors, dotProduct, multiplyVector } from "./geometry";
import { MAX_BOUNCES, CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants";

interface RaySegment {
  start: Vector2;
  end: Vector2;
  color: string;
}

export const calculateRays = (elements: OpticalElement[]): RaySegment[] => {
  const segments: RaySegment[] = [];
  const activeRays: Ray[] = [];

  // 1. Initialize Rays from Sources
  elements.forEach(el => {
    if (el.type === ElementType.RaySource || el.type === ElementType.BeamSource || el.type === ElementType.PointSource) {
      const dirRad = degToRad(el.rotation);
      const normal = { x: Math.cos(dirRad), y: Math.sin(dirRad) };
      const perp = { x: -normal.y, y: normal.x }; // Perpendicular to direction
      
      const count = el.rayCount || 1;
      const spread = el.spread || 0;
      const color = el.color || '#fff';

      if (el.type === ElementType.BeamSource) {
        // Parallel rays spaced out along the width of the source
        // Use el.width for the physical size of the beam emitter
        const width = el.width || 40;
        const spacing = count > 1 ? width / (count - 1) : 0;
        const startOffset = -width / 2;

        for (let i = 0; i < count; i++) {
          const offset = startOffset + i * spacing;
          const origin = {
            x: el.x + perp.x * offset,
            y: el.y + perp.y * offset
          };
          activeRays.push({
            start: origin,
            direction: normal,
            intensity: 1,
            color
          });
        }
      } else if (el.type === ElementType.PointSource) {
        // Fan of rays
        // spread is the angle of the fan
        const startAngle = dirRad - degToRad(spread) / 2;
        const angleStep = count > 1 ? degToRad(spread) / (count - 1) : 0;

        for (let i = 0; i < count; i++) {
          const angle = startAngle + i * angleStep;
          activeRays.push({
            start: { x: el.x, y: el.y },
            direction: { x: Math.cos(angle), y: Math.sin(angle) },
            intensity: 1,
            color
          });
        }
      } else {
        // Single Ray
        activeRays.push({
          start: { x: el.x, y: el.y },
          direction: normal,
          intensity: 1,
          color
        });
      }
    }
  });

  // 2. Ray Tracing Loop
  let rayQueue = activeRays.map(r => ({ ray: r, bounce: 0 }));

  while (rayQueue.length > 0) {
    const current = rayQueue.shift();
    if (!current) break;
    if (current.bounce >= MAX_BOUNCES) continue;

    const { ray } = current;
    
    // Find closest intersection
    let closestHit: { t: number, point: Vector2, element: OpticalElement } | null = null;
    let minT = Infinity;

    for (const el of elements) {
      if ([ElementType.RaySource, ElementType.BeamSource, ElementType.PointSource].includes(el.type)) continue;

      // Define element as a line segment
      const elDirRad = degToRad(el.rotation);
      
      const elNormal = { x: Math.cos(elDirRad), y: Math.sin(elDirRad) };
      const surfDir = { x: -elNormal.y, y: elNormal.x }; // Vector along the surface
      
      const halfWidth = el.width / 2;
      const p1 = {
        x: el.x + surfDir.x * halfWidth,
        y: el.y + surfDir.y * halfWidth
      };
      const p2 = {
        x: el.x - surfDir.x * halfWidth,
        y: el.y - surfDir.y * halfWidth
      };

      const hit = getRaySegmentIntersection(
        ray.start.x, ray.start.y, ray.direction.x, ray.direction.y,
        p1.x, p1.y, p2.x, p2.y
      );

      if (hit && hit.t < minT) {
        minT = hit.t;
        closestHit = { t: hit.t, point: hit.point, element: el };
      }
    }

    if (closestHit) {
      // Add segment
      segments.push({
        start: ray.start,
        end: closestHit.point,
        color: ray.color
      });

      // Calculate next ray
      const el = closestHit.element;
      const elDirRad = degToRad(el.rotation);
      const elNormal = { x: Math.cos(elDirRad), y: Math.sin(elDirRad) };
      const surfDir = { x: -elNormal.y, y: elNormal.x };

      if (el.type === ElementType.Mirror) {
        // Reflection: R = I - 2(I.N)N
        const dot = dotProduct(ray.direction, elNormal);
        const r = subVectors(ray.direction, multiplyVector(elNormal, 2 * dot));
        
        rayQueue.push({
          ray: {
            start: closestHit.point,
            direction: normalizeVector(r),
            intensity: ray.intensity * 0.9,
            color: ray.color
          },
          bounce: current.bounce + 1
        });

      } else if (el.type === ElementType.Blocker) {
         // PHYSICS: Absorbs ray. 
         // We do not push to rayQueue, effectively stopping the light path here.
      } else if (el.type === ElementType.ConvexLens || el.type === ElementType.ConcaveLens) {
        // PHYSICS: Thin Lens Equation Implementation
        // We use the approximation that the change in angle is proportional to the height from the optical center.
        
        const center = { x: el.x, y: el.y };
        const hitToCenter = subVectors(closestHit.point, center);
        
        // Project hitToCenter onto the surface direction to get local 'height' y_local
        const yLocal = dotProduct(hitToCenter, surfDir);
        
        // Focal Length
        let f = el.focalLength || 100;
        
        // PHYSICS: Negative focal length for Concave Lens to cause divergence
        if (el.type === ElementType.ConcaveLens) f = -f;

        // Change in slope (angle approximation for thin lens)
        // Ray dir in world
        const rayAngleWorld = Math.atan2(ray.direction.y, ray.direction.x);
        const normalAngleWorld = Math.atan2(elNormal.y, elNormal.x);
        
        // Ray angle relative to normal
        let angleRelToNormal = rayAngleWorld - normalAngleWorld;
        
        // Normalize to -PI to PI
        while (angleRelToNormal > Math.PI) angleRelToNormal -= 2 * Math.PI;
        while (angleRelToNormal < -Math.PI) angleRelToNormal += 2 * Math.PI;

        // THIN LENS FORMULA (Paraxial approx): 
        // tan(theta_out) = tan(theta_in) - y / f
        // This calculates the new angle of the ray after passing through the lens.
        
        const tanIn = Math.tan(angleRelToNormal);
        const tanOut = tanIn - yLocal / f; 
        const angleOutRel = Math.atan(tanOut);
        
        const angleOutWorld = angleOutRel + normalAngleWorld;
        
        const newDir = {
          x: Math.cos(angleOutWorld),
          y: Math.sin(angleOutWorld)
        };

        rayQueue.push({
          ray: {
            start: closestHit.point,
            direction: normalizeVector(newDir),
            intensity: ray.intensity * 0.95,
            color: ray.color
          },
          bounce: current.bounce + 1
        });
      }

    } else {
      // No hit, ray goes to infinity (edge of canvas)
      const EXTEND_DIST = 3000;
      const end = {
        x: ray.start.x + ray.direction.x * EXTEND_DIST,
        y: ray.start.y + ray.direction.y * EXTEND_DIST
      };
      segments.push({
        start: ray.start,
        end: end,
        color: ray.color
      });
    }
  }

  return segments;
};