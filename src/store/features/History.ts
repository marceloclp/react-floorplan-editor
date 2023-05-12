import { createAction } from '@reduxjs/toolkit';
import { createFeature } from '../utils/toolkit';
import { historyUndoEntry } from '../helpers/historyUndoEntry';

/**
 * 
 */
export const historyUndo = createAction('history:undo');

/**
 * 
 */
export const historyUndoAll = createAction('history:undo_all');

/**
 * 
 */
export const historyRedo = createAction('history:redo');

export default createFeature((builder) => {
  builder
    .addCase(historyUndo, historyUndoEntry)
    .addCase(historyUndoAll, (state) => {
      while (state.history.undoStack.length > 1)
        historyUndoEntry(state);
    })
    .addCase(historyRedo, (state) => {
      const { redoStack, undoStack, maxSize } = state.history;

      // There is nothing to redo:
      if (redoStack.length === 0) return;

      const discardedState = redoStack.pop()!;

      undoStack.push(discardedState);
      if (undoStack.length > maxSize)
        undoStack.splice(1, 1);

      const nextState = undoStack.at(-1)!;

      state.vertices = nextState.vertices;
      state.walls = nextState.walls;
    });
});