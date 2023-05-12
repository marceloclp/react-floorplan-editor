import { Draft } from '@reduxjs/toolkit';
import RootState from '../types/RootState';

export function historyUndoEntry(state: Draft<RootState>) {
  const { redoStack, undoStack, maxSize } = state.history;

  // Contains only the initial state, so can't undo
  if (undoStack.length <= 1) return;

  const discardedState = undoStack.pop()!;
  
  redoStack.push(discardedState);
  if (redoStack.length > maxSize)
    // If redo stack exceeds max size, then drop the farthest state
    redoStack.shift();

  const nextState = undoStack.at(-1)!;

  state.vertices = nextState.vertices;
  state.walls = nextState.walls;
}
