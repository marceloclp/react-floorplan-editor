import { FC } from "react"
import cx from "../../utils/cx"
import { HandleZoom } from "../../hooks/useZooming"

type Props = {
  className?: string;
  zoom: number;
  handleZoom: HandleZoom;
};

const ZoomControl: FC<Props> = ({ className, zoom, handleZoom }) => (
  <div className={cx(
    'flex items-center',
    'h-9',
    className
  )}>
    <button
      className={cx(
        'flex items-center justify-center',
        'w-12 h-full',
        'rounded-tl-md rounded-bl-md',
        'bg-white hover:bg-gray-50',
        'border border-gray-300',
        'ring-2 ring-transparent focus:ring-blue-500',
        'focus:z-10',
      )}
      onClick={() => handleZoom((zoom, step) => zoom - step)}
    >
      -
    </button>
    <button
      className={cx(
        'flex items-center justify-center',
        'w-24 h-full',
        'bg-white hover:bg-gray-50',
        'border-t border-b border-gray-300',
        'ring-2 ring-transparent focus:ring-blue-500',
        'focus:z-10',
        'text-sm',
      )}
      onClick={() => handleZoom(1)}
    >
      {(zoom * 100).toFixed(0)} %
    </button>
    <button
      className={cx(
        'flex items-center justify-center',
        'w-12 h-full',
        'rounded-tr-md rounded-br-md',
        'bg-white hover:bg-gray-50',
        'border border-gray-300',
        'ring-2 ring-transparent focus:ring-blue-500',
        'focus:z-10',
      )}
      onClick={() => handleZoom((zoom, step) => zoom + step)}
    >
      +
    </button>
  </div>
);

export default ZoomControl;
