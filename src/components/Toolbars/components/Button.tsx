import { FC, PropsWithChildren } from 'react';
import cx from '../../../utils/cx';

type Props = PropsWithChildren<{
  className?: string;
  /** */
  shortcut?: string;
  /** */
  active?: boolean;
  /** */
  disabled?: boolean;
  /** */
  onClick?: () => void;
}>

const Button: FC<Props> = ({
  children,
  className,
  shortcut,
  active = false,
  disabled = false,
  onClick,
}) => (
  <button
    disabled={disabled}
    className={cx(
      'relative',
      'flex items-center justify-center',
      'w-9 h-9 rounded-md',
      cx(
        'bg-white',
        'hover:bg-gray-100',
        active && 'bg-indigo-100 hover:bg-indigo-100',
      ),
      cx(
        'ring-1',
        'ring-transparent',
        'focus-visible:ring-blue-500',
      ),
      cx(
        'text-gray-400',
        'stroke-gray-500 hover:stroke-gray-700',
        active && 'stroke-indigo-500 hover:stroke-indigo-500',
        active && 'text-indigo-400',
      ),
      'disabled:pointer-events-none',
      'disabled:opacity-50',
      className
    )}
    onClick={onClick}
  >
    <span className={cx(
      !!shortcut && '-translate-x-0.5'
    )}>
      {children}
    </span>
    {shortcut && (
      <span className={cx(
        'absolute',
        'bottom-1 right-1',
        'font-monospace',
        'text-[0.6rem] font-semibold uppercase',
      )}>{shortcut}</span>
    )}
  </button>
);

export default Button;
