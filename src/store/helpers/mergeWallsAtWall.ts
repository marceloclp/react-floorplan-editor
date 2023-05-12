import { Draft } from '@reduxjs/toolkit';
import RootState from '../types/RootState';
import WallEntity from '../types/WallEntity';
import { deleteWall } from './deleteWall';

/**
 * Given a target wall:
 *  1. Delete all walls whose vertices are the same as the target wall
 *  2. Delete the vertices connected to the deleted walls that are no longer
 *     connected to something.
 */
export function mergeWallsAtWall(
  state: Draft<RootState>,
  wallId: string,
  getWallsAtVertex: (vertexId: string) => WallEntity[]
) {
  const targetWall = state.walls[wallId];

  // Skip if the target wall does not exist
  if (!targetWall) return 0;

  const wallsAtV1 = getWallsAtVertex(targetWall.v1);
  const wallsAtV2 = getWallsAtVertex(targetWall.v2);

  // Checks if two walls are placed exactly on top of each other.
  const compareWalls = (wallA: WallEntity, wallB: WallEntity) => {
    const vA = [state.vertices[wallA.v1], state.vertices[wallA.v2]]
      .map((v) => `${v.x}_${v.y}`).sort();
    const vB = [state.vertices[wallB.v1], state.vertices[wallB.v2]]
      .map((v) => `${v.x}_${v.y}`).sort();;
    return vA[0] === vB[0] && vA[1] === vB[1];
  };

  let deletedCount = 0;

  [...wallsAtV1, ...wallsAtV2].forEach((wall) => {
    // Skip the target wall:
    if (wall.id === wallId) return;

    if (!compareWalls(targetWall, wall)) return;

    deleteWall(state, wall.id, getWallsAtVertex);
    deletedCount += 1;
  });

  return deletedCount;
}
