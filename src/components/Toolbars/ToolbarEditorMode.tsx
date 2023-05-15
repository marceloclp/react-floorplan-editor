import { ArrowPathRoundedSquareIcon, HandRaisedIcon, LockClosedIcon, MinusCircleIcon, PlusCircleIcon, ViewfinderCircleIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import Button from './components/Button';
import Divider from './components/Divider';
import Toolbar from './components/Toolbar';
import { EDITOR_MODES } from '../../store/constants';
import RootState from '../../store/types/RootState';

const ToolbarEditorMode: FC = () => {
  const mode = useSelector((state: RootState) => state.mode);

  return (
    <Toolbar>
      <Button>
        <LockClosedIcon className="w-4 h-4 stroke-inherit" />
      </Button>
      <Divider />
      <Button shortcut="␣" active={mode === EDITOR_MODES.PANNING}>
        <HandRaisedIcon className="w-4 h-4 stroke-inherit translate-x-0.5" />
      </Button>
      {/* <ToolbarButton active={mode === EDITOR_MODES.DRAGGING_VERTEX}>
        <ViewfinderCircleIcon className="w-4 h-4 stroke-gray-500" />
      </ToolbarButton> */}
      <Button active={mode === EDITOR_MODES.PLACING_WALL}>
        <ArrowPathRoundedSquareIcon className="w-4 h-4 stroke-gray-500" />
      </Button>
      <div className="self-stretch w-px flex items-center mx-1">
        <div className="w-px bg-gray-200 py-4" />
      </div>
      {/* <ToolbarButton shortcut="⌥">
        <MinusCircleIcon className="w-4 h-4 stroke-gray-500" />
      </ToolbarButton> */}
      <Button shortcut="⌥" active={mode === EDITOR_MODES.PLACING_VERTEX}>
        <PlusCircleIcon className="w-4 h-4 stroke-gray-500" />
      </Button>
      <Button shortcut="D" active={mode === EDITOR_MODES.ENTITY_DELETE}>
        <MinusCircleIcon className="w-4 h-4 stroke-gray-500" />
      </Button>
      <Button shortcut="⌘" active={mode === EDITOR_MODES.DRAGGING_VERTEX}>
        <ViewfinderCircleIcon className="w-4 h-4 stroke-gray-500" />
      </Button>
    </Toolbar>
  );
};

export default ToolbarEditorMode;
