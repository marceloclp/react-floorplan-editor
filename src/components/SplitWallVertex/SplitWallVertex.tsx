import { FC } from 'react';
import transform from '../../utils/transform';
import Angle from '../Angle/Angle';

type Props = {
  x0: number;
  y0: number;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
}

const isNumber = (v: any): v is Number => typeof v === 'number';

const SplitWallVertex: FC<Props> = ({ x0, y0, x1, y1, x2, y2 }) => (
  <g className="pointer-events-none">
    {isNumber(x1) && isNumber(y1) && isNumber(x2) && isNumber(y2) && (
      <Angle x0={x1} y0={y1} x1={x0} y1={y0} x2={x2} y2={y2} r={20} />
    )}
    {isNumber(x1) && isNumber(y1) && (
      <line x1={x1} y1={y1} x2={x0} y2={y0} strokeWidth={6} className="stroke-blue-500/50" />
    )}
    {isNumber(x2) && isNumber(y2) && (
      <line x1={x2} y1={y2} x2={x0} y2={y0} strokeWidth={6} className="stroke-blue-500/50" />
    )}
    <g transform={transform({ x: x0, y: y0 })}>
      <circle r={12} className="fill-blue-500/50" />
      <circle r={6} strokeWidth={4} className="fill-white stroke-blue-800" />
    </g>
  </g>
);

export default SplitWallVertex;