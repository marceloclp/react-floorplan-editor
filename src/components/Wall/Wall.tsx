import { FC, SVGProps } from "react"
import cx from "../../utils/cx"
import transform from "../../utils/transform"

type Props = {
  id: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  isSelected?: boolean;
  isDragging?: boolean;
  isSplitting?: boolean;
  isPlacing?: boolean;
};

const Wall: FC<Props> = ({
  id,
  x1,
  x2,
  y1,
  y2,
  isSelected,
  isDragging,
  isSplitting,
  isPlacing,
}) => {
  const getLineProps = ({ width = 0 }): SVGProps<SVGLineElement> => ({
    x1,
    x2,
    y1,
    y2,
    strokeLinecap: 'round',
    strokeWidth: width,
  });
  const textX = (x1 + x2) / 2;
  const textY = (y1 + y2) / 2;

  const length = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  
  return (
    <g
      className={cx(
        'group',
        (isDragging || isSplitting) && 'pointer-events-none',
        'cursor-pointer',
        isPlacing && 'opacity-50',
      )}
      data-entity-type="wall"
      data-entity-id={id}
    >
      {/* Hover element. */}
      <line
        {...getLineProps({ width: 16 })}
        className={cx(
          'stroke-transparent',
          'group-hover:stroke-blue-500/20',
          isSelected && 'stroke-red-500/20 group-hover:stroke-red-500/30',
          isDragging && 'stroke-green-500/20 group-hover:stroke-green-500/30',
          isSplitting && 'stroke-yellow-500/20 group-hover:stroke-yellow-500/30',
        )}
      />
      {/* Actual line without pointer-events. */}
      <line
        {...getLineProps({ width: 6 })}
        className={cx(
          'pointer-events-none',
          'stroke-blue-500',
          isSelected && 'stroke-red-700/50',
          isDragging && 'stroke-green-700',
          isSplitting && 'stroke-yellow-700/50',
          'duration-75 ease-in-out',
          'transition-colors',
        )}
      />
      <text
        className={cx(
          'opacity-0',
          !isDragging && 'group-hover:opacity-100',
          'pointer-events-none p-2 text-sm'
        )}
        transform={transform({ x: textX, y: textY })}
        textAnchor="middle"
        alignmentBaseline="central"
        baselineShift={20}
      >
        {`ㅤ`}{length.toFixed(1)}px{`ㅤ`}
      </text>
      <text transform={transform({ x: textX, y: textY })} className="font-extrabold pointer-events-none fill-red-500 text-xs select-none">{id}</text>
    </g>
  )
};

export default Wall;