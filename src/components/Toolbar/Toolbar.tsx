import { FC } from "react"
import cx from "../../utils/cx"
import ToolbarButton from "./ToolbarButton"

import { ArrowPathRoundedSquareIcon, HandRaisedIcon, LockClosedIcon, MinusCircleIcon, PlusCircleIcon, ViewfinderCircleIcon } from "@heroicons/react/24/outline";

export type Tool =
  | 'pan'
  | 'vertex_drag'
  | 'vertex_place'
  | 'wall_draw'
  | 'wall_drag';

type Props = {
  activeTool?: Tool;
  onToolSelect: (tool: Tool) => void;
};

const Toolbar: FC<Props> = ({ activeTool, onToolSelect }) => {
  const isActive = (tool: Tool) => activeTool === tool;

  return (
    <div className={cx(
      'flex items-center',
      'bg-white',
      'border border-gray-200',
      'rounded-lg',
      'p-1 gap-1',
      'drop-shadow-md',
    )}>
      <ToolbarButton>
        <LockClosedIcon className="w-4 h-4 stroke-inherit" />
      </ToolbarButton>
      <div className="self-stretch w-px flex items-center mx-1">
        <div className="w-px bg-gray-200 py-4" />
      </div>
      <ToolbarButton active={isActive('pan')}>
        <HandRaisedIcon className="w-4 h-4 stroke-inherit" />
      </ToolbarButton>
      <ToolbarButton active={isActive('vertex_drag')}>
        <ViewfinderCircleIcon className="w-4 h-4 stroke-gray-500" />
      </ToolbarButton>
      <ToolbarButton active={isActive('wall_draw')}>
        <ArrowPathRoundedSquareIcon className="w-4 h-4 stroke-gray-500" />
        {/* <WallDragIcon className="w-4 h-4 stroke-gray-500" /> */}
      </ToolbarButton>
      <div className="self-stretch w-px flex items-center mx-1">
        <div className="w-px bg-gray-200 py-4" />
      </div>
      <ToolbarButton shortcut="⌥">
        <MinusCircleIcon className="w-4 h-4 stroke-gray-500" />
      </ToolbarButton>
      <ToolbarButton shortcut="⌘" active={isActive('vertex_place')}>
        <PlusCircleIcon className="w-4 h-4 stroke-gray-500" />
      </ToolbarButton>
    </div>
  );
}

export default Toolbar;
