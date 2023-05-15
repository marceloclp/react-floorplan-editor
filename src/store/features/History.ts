import { Draft, createAction, current } from '@reduxjs/toolkit';
import RootState from '../types/RootState';
import { createFeature } from '../utils/toolkit';

/**
 * 
 */
export const historyPush = createAction('history:push');

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
  const restore = (state: Draft<RootState>) => {
    const { history, currentIndex } = state.history;
    const entry = history[currentIndex];
  
    state.walls = entry.walls;
    state.vertices = entry.vertices;
  };

  builder
    .addCase(historyPush, (state) => {
      const snapshot = {
        vertices: current(state.vertices),
        walls: current(state.walls),
      };
      state.history.history.push(snapshot);
      state.history.currentIndex++;
    })
    .addCase(historyUndo, (state) => {
      // Can't undo if there are no entries to the left of the pointer:
      if (state.history.currentIndex <= 0) return;

      // Undo successful, move pointer to the left:
      state.history.currentIndex -= 1;

      restore(state);
    })
    .addCase(historyUndoAll, (state) => {
      // Can't undo if there are no entries to the left of the pointer:
      if (state.history.currentIndex <= 0) return;

      // Undo all successful, move pointer back to the initial state:
      state.history.currentIndex = 0;

      restore(state);
    })
    .addCase(historyRedo, (state) => {
      const { history, currentIndex } = state.history;

      // Can't redo if there are no entries to the right of the pointer:
      if (currentIndex >= history.length - 1) return;

      // Redo successful, move pointer to the right:
      state.history.currentIndex += 1;

      restore(state);
    });
});