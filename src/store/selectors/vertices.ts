import { createSelector } from '@reduxjs/toolkit';
import RootState from '../types/RootState';

export const getSelectedVertices = createSelector(
  (state: RootState) => state.vertices,
  (vertices) =>
    Object.values(vertices).filter(({ isSelected }) => isSelected),
);

export const getPlacingVertex = createSelector(
  (state: RootState) => state.vertices,
  (vertices) => Object
    .values(vertices)
    // The placing vertex should always be the last element, so this should be O(1)
    .findLast(({ isPlacing }) => isPlacing),
);
