import { createSelector } from '@reduxjs/toolkit';
import RootState from '../types/RootState';

export const selectCanUndo = createSelector(
  (state: RootState) => state.history.currentIndex,
  (currentIndex) => currentIndex > 0,
);

export const selectCanRedo = createSelector(
  (state: RootState) => state.history.history.length,
  (state: RootState) => state.history.currentIndex,
  (historyLength, currentIndex) => currentIndex < historyLength - 1
);
