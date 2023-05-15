import { ArrowPathIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from './components/Button';
import Divider from './components/Divider';
import Toolbar from './components/Toolbar';
import { historyRedo, historyUndo, historyUndoAll } from '../../store/features/History';
import { zoomChange , zoomReset } from '../../store/features/Zooming';
import { selectCanRedo, selectCanUndo } from '../../store/selectors/history';
import { selectZoomLevel } from '../../store/selectors/zooming';

const ToolbarHistory: FC = () => {
  const dispatch = useDispatch();

  const canUndo = useSelector(selectCanUndo);
  const canRedo = useSelector(selectCanRedo);
  const zoom    = useSelector(selectZoomLevel);

  return (
    <Toolbar>
      <Button onClick={() => dispatch(zoomChange(0.1))}>
        <PlusIcon className="w-4 h-4 stroke-inherit" />
      </Button>
      <Button className="w-12 text-xs" onClick={() => dispatch(zoomReset())}>
        {(zoom * 100).toFixed(0)}%
      </Button>
      <Button onClick={() => dispatch(zoomChange(-0.1))}>
        <MinusIcon className="w-4 h-4 stroke-inherit" />
      </Button>

      <Divider />

      <Button onClick={() => dispatch(historyUndo())} disabled={!canUndo}>
        <ArrowUturnLeftIcon className="w-4 h-4 stroke-inherit" />
      </Button>
      <Button onClick={() => dispatch(historyUndoAll())} disabled={!canUndo}>
        <ArrowPathIcon className="w-4 h-4 stroke-inherit" />
      </Button>
      <Button onClick={() => dispatch(historyRedo())} disabled={!canRedo}>
        <ArrowUturnRightIcon className="w-4 h-4 stroke-inherit" />
      </Button>
    </Toolbar>
  );
};

export default ToolbarHistory;
