import { createSelector } from '@reduxjs/toolkit';
import RootState from '../types/RootState';
import VertexEntity from '../types/VertexEntity';

export const getSelectedWalls = createSelector(
  (state: RootState) => state.walls,
  (walls) =>
    Object.values(walls).filter(({ isSelected }) => isSelected),
);

export const getUniqueVerticesFromSelectedWalls = createSelector(
  (state: RootState) => state.vertices,
  getSelectedWalls,
  (vertices, wallsArray) => {
    const obj = wallsArray.reduce((obj, { v1, v2 }) => {
      return { ...obj, [v1]: vertices[v1], [v2]: vertices[v2] };
    }, {} as Record<string, VertexEntity>);
    return Object.values(obj);
  }
);

export const getSplitTargetWall = createSelector(
  (state: RootState) => state.walls,
  (walls) => Object
    .values(walls)
    .findLast(({ isSplitTarget }) => isSplitTarget),
);

export const getSplittingWalls = createSelector(
  (state: RootState) => state.walls,
  (walls) => Object
    .values(walls)
    .filter(({ isSplitting }) => isSplitting),
);
