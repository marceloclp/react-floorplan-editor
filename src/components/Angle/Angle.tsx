import { lineAngle, lineMidpoint, pointTranslate } from 'geometric';
import { FC } from 'react';
import Point from '../../types/Point';
import transform from '../../utils/transform';

type Props = {
  x0: number;
  y0: number;

  x1: number;
  y1: number;

  x2: number;
  y2: number;

  r?: number;
};

const Angle: FC<Props> = ({ x0, y0, x1, y1, x2, y2, r = 20 }) => {
  const A: Point = { x: x0, y: y0 };
  const B: Point = { x: x1, y: y1 };
  const C: Point = { x: x2, y: y2 };

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

  if (Math.abs(angle) === Math.PI || isNaN(angle))
    return null;

  const startX = B.x + BAnorm.x * r;
  const startY = B.y + BAnorm.y * r;

  const midX = startX + BCnorm.x * r;
  const midY = startY + BCnorm.y * r;

  const endX = B.x + BCnorm.x * r;
  const endY = B.y + BCnorm.y * r;

  // TODO: understand this piece of shit math
  // TODO: refactor
  const midPoint = lineMidpoint([[startX, startY], [endX, endY]]);
  const midPointAngle = lineAngle([[B.x, B.y], midPoint]);
  const [textX, textY] = pointTranslate(midPoint, midPointAngle, 25);

  // Draw the arc counter-clockwise when the angle is negative:
  const sweepFlag = angle > 0 ? 1 : 0;

  const arc = Math.abs(angle) === Math.PI / 2
    ? `M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${endY}`
    : `M ${startX} ${startY} A ${r} ${r} 0 0 ${sweepFlag} ${endX} ${endY}`;

  return (
    <g data-entity-type="angle" className="pointer-events-none">
      <path d={arc} strokeWidth={4} className="fill-transparent stroke-blue-200" />
      <text transform={transform({ x: textX, y: textY })} textAnchor="middle" alignmentBaseline="central" className="text-xs opacity-80 select-none">
        {(Math.abs(angle * 180 / Math.PI)).toFixed(0)}°
      </text>
    </g>
  );
};

export default Angle;