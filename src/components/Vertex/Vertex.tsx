import { FC } from 'react'
import transform from '../../utils/transform'
import cx from '../../utils/cx'

type Props = {
  x: number;
  y: number;
  index: number;
  isSelected: boolean;
  /** Takes priority over `isSelected` */
  isDragging: boolean;
  isPlacing?: boolean;
  isSplitting?: boolean;
}

const Vertex: FC<Props> = ({
  x,
  y,
  index,
  isSelected = false,
  isDragging = false,
  isPlacing = false,
  isSplitting = false,
}) => (
  <g
    transform={transform({ x, y })}
    data-entity-type="vertex"
    data-entity-index={index}
    className={cx(
      'group',
      isPlacing && 'opacity-50 pointer-events-none',
      isSplitting && 'opacity-50 pointer-events-none',
    )}
  >
    {/* Increases interactivity area. */}
    <circle r={20} className="fill-transparent" />
    {/* Hover effect. */}
    <circle
      className={cx(
        'pointer-events-none',
        'fill-transparent group-hover:fill-blue-500/20',
        isSelected && cx(
          'fill-red-500/20 group-hover:fill-red-500/20'
        ),
        isDragging && cx(
          'fill-green-500/20 group-hover:fill-green-500/20'
        ),
      )}
      r={16}
    />
    {/* Visible circle element. */}
    <circle
      className={cx(
        'fill-blue-200',
        'stroke-blue-500',
        isSelected && cx(
          'fill-white group-hover:fill-white',
          'stroke-red-700 group-hover:stroke-red-700',
        ),
        isDragging && cx(
          'fill-white group-hover:fill-white',
          'stroke-green-700 group-hover:stroke-green-700',
        ),
        'duration-75 ease-in-out',
        'transition-colors',
      )}
      r={8}
      strokeWidth={4}
    />
    <text className="translate-y-4 translate-x-4 font-extrabold pointer-events-none">{index}</text>
  </g>
);

export default Vertex;
