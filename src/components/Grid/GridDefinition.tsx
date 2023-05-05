import { FC } from "react"
import cx from "../../utils/cx"

type Props = {
  className?: string;
  id: string;
  gridX: number;
  gridY: number;
  r?: number;
};

const GridDefinition: FC<Props> = ({ className, id, gridX, gridY, r = 2 }) => (
  <g className={cx('stroke-gray-0', className)}>
    <pattern id={id} width={gridX} height={gridY} patternUnits="userSpaceOnUse">
      <circle className="fill-gray-100" r={r} cx={0} cy={0} />
      <circle className="fill-gray-100" r={r} cx={gridX} cy={0} />
      <circle className="fill-gray-100" r={r} cx={gridX} cy={gridY} />
      <circle className="fill-gray-100" r={r} cx={0} cy={gridY} />
    </pattern>
  </g>
);

export default GridDefinition;
