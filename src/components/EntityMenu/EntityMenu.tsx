import { FC, MouseEventHandler } from "react"
import cx from "../../utils/cx"
import { TrashIcon } from '@heroicons/react/24/outline'

type Props = {
  onDeleteClick: MouseEventHandler<HTMLButtonElement>;
};

const EntityMenu: FC<Props> = ({
  onDeleteClick,
}) => (
  <div
    className={cx(
      'flex items-center',
      'h-9',
    )}
  >
    {onDeleteClick && (
      <button
        className={cx(
          'flex items-center justify-center gap-2',
          'h-full pl-4 pr-6 rounded-md',
          'bg-red-100 hover:bg-red-300',
          'border border-red-300',
          'ring-2 ring-transparent focus:ring-blue-500',
          'focus:z-10',
          'text-sm text-red-900',
        )}
        onClick={onDeleteClick}
      >
        <TrashIcon className="w-4 h-4" />
        Delete
      </button>
    )}
  </div>
)

export default EntityMenu;
