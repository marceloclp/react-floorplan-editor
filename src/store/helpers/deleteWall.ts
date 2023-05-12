import { Draft } from '@reduxjs/toolkit';
import RootState from '../types/RootState';
import WallEntity from '../types/WallEntity';

export function deleteWall(
  state: Draft<RootState>,
  wallId: string,
  getWallsAtVertex: (vertexId: string) => WallEntity[]
) {
  const wall = state.walls[wallId];

  if (!wall) return false;

  // When deleting a wall, we need to make to also delete any unreachable vertex
  // that was created from deleting the wall:

  const { v1, v2 } = wall;

  if (getWallsAtVertex(v1).length === 1 && getWallsAtVertex(v1)[0].id === wallId) {
    // Delete unreachable vertex:
    delete state.vertices[v1];
  }

  if (getWallsAtVertex(v2).length === 1 && getWallsAtVertex(v2)[0].id === wallId) {
    // Delete unreachable vertex:
    delete state.vertices[v2];
  }

  delete state.walls[wallId];

  return true;
}
