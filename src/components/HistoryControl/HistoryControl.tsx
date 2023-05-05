import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { History } from "../../hooks/useHistory"
import Point from "../../types/Point"
import cx from "../../utils/cx"
import { EditorHistory } from "../Editor/Editor"

type SetVerticesAction = Dispatch<SetStateAction<Point[]>>;

type Props = {
  className?: string;
  history: EditorHistory;
  setVertices: SetVerticesAction;
};

const HistoryControl: FC<Props> = ({ className, history, setVertices }) => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    return history.on((undoStack, redoStack) => {
      setCanUndo(undoStack.length > 1);
      setCanRedo(redoStack.length > 0);
    });
  }, [history]);

  return (
    <div className={cx(
      'flex items-center',
      'h-9',
      className
    )}>
      <button
        className={cx(
          'flex items-center justify-center',
          'w-16 h-full',
          'rounded-tl-md rounded-bl-md',
          'bg-white hover:bg-gray-50',
          'border border-gray-300',
          'ring-2 ring-transparent focus:ring-blue-500',
          'focus:z-10',
          'text-sm',
          !canUndo && cx(
            'pointer-events-none',
            'bg-gray-100'
          ),
        )}
        onClick={() => {
          setVertices(history.undo());
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      </button>
      <button
        className={cx(
          'flex items-center justify-center',
          'w-16 h-full',
          'bg-white hover:bg-gray-50',
          'border-t border-b border-gray-300',
          'ring-2 ring-transparent focus:ring-blue-500',
          'focus:z-10',
          'text-sm',
          !canRedo && cx(
            'pointer-events-none',
            'bg-gray-100'
          ),
        )}
        onClick={() => {
          setVertices(history.undoAll());
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
      <button
        className={cx(
          'flex items-center justify-center',
          'w-16 h-full',
          'rounded-tr-md rounded-br-md',
          'bg-white hover:bg-gray-50',
          'border border-gray-300',
          'ring-2 ring-transparent focus:ring-blue-500',
          'focus:z-10',
          'text-sm',
          !canRedo && cx(
            'pointer-events-none',
            'bg-gray-100'
          ),
        )}
        onClick={() => {
          setVertices(history.redo());
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
      </svg>
      </button>
    </div>
  );
};

export default HistoryControl;