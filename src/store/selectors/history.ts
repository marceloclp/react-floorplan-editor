import { createSelector } from '@reduxjs/toolkit';
import RootState from '../types/RootState';

export const selectCanUndo = createSelector(
  (state: RootState) => state.history,
  (history) => history.undoStack.length > 1,
);

export const selectCanRedo = createSelector(
  (state: RootState) => state.history,
  (history) => history.redoStack.length > 0,
);
