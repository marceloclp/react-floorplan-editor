import { Draft, current } from '@reduxjs/toolkit';
import RootState from '../types/RootState';

export function historyPushEntry(state: Draft<RootState>) {
  const { undoStack, maxSize } = state.history;

  const snapshot = {
    vertices: state.vertices,
    walls: state.walls,
  };

  undoStack.push(snapshot);

  if (undoStack.length > maxSize)
    undoStack.splice(1, 1);
}
