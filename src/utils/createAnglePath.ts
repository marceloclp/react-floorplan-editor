import Point from "../types/Point"

/**
 * Returns the drawing path for the internal angle of the triangle ABC at point B.
 */
export default function createAnglePath(A: Point, B: Point, C: Point, r: number) {
  // Find the vectors formed by the intersection point:
  const BA = { x: A.x - B.x, y: A.y - B.y };
  const BC = { x: C.x - B.x, y: C.y - B.y };

  const BAmag = Math.sqrt(BA.x * BA.x + BA.y * BA.y);
  const BCmag = Math.sqrt(BC.x * BC.x + BC.y * BC.y);

  // Find their unit vectors:
  const BAnorm = { x: BA.x / BAmag, y: BA.y / BAmag };
  const BCnorm = { x: BC.x / BCmag, y: BC.y / BCmag };

  const dotProduct = BAnorm.x * BCnorm.x + BAnorm.y * BCnorm.y;
  const crossProduct = BAnorm.x * BCnorm.y - BAnorm.y * BCnorm.x;

  // Because BA and BC are normalized, the angle is stable in all quadrants:
  // (0, 180) when ABC is formed clockwise
  // (-180, 0) when ABC is formed counter-clockwise
  const angle = Math.atan2(crossProduct, dotProduct);

  const startX = B.x + BAnorm.x * r;
  const startY = B.y + BAnorm.y * r;

  const endX = B.x + BCnorm.x * r;
  const endY = B.y + BCnorm.y * r;

  // If angle is 90 degrees we draw a right angle:
  if (Math.abs(angle) === Math.PI / 2) {
    const midX = startX + BCnorm.x * r;
    const midY = startY + BCnorm.y * r;

    return `M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${endY}`;
  }

  // Draw the arc counter-clockwise when the angle is negative:
  const sweepFlag = angle > 0 ? 1 : 0;

  return `M ${startX} ${startY} A ${r} ${r} 0 0 ${sweepFlag} ${endX} ${endY}`
}
