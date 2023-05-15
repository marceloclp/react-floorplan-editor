import { FC } from 'react';

type Props = {
  className?: string;
  gridId: string;
};

const Grid: FC<Props> = ({ gridId }) => (
  <g>
    {Array(4).fill(0).map((_, i) => (
      <rect
        key={i}
        width="100vw"
        height="100vw"
        fill={`url(#${gridId})`}
        transform={`rotate(${i * 90})`}
        data-entity-type="grid"
      />
    ))}
    <line x1="-100%" x2="100%" className="stroke-gray-100/50 stroke-[2px]" data-entity-type="grid" />
    <line y1="-100%" y2="100%" className="stroke-gray-100/50 stroke-[2px]" data-entity-type="grid" />
  </g>
);

export default Grid;
