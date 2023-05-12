import { Draft } from '@reduxjs/toolkit';
import RootState from '../types/RootState';

export function deleteVertex(state: Draft<RootState>, vertexId: string) {
  const vertex = state.vertices[vertexId];

  if (!vertex) return false;

  Object
    .values(state.walls)
    .filter(({ v1, v2 }) => {
      return v1 === vertexId || v2 === vertexId;
    })
    .forEach((wall) => {
      delete state.walls[wall.id];
    });
  delete state.vertices[vertexId];

  return true;
};
