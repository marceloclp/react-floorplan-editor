import { Draft } from '@reduxjs/toolkit';
import Point from '../../types/Point';
import RootState from '../types/RootState';
import VertexEntity from '../types/VertexEntity';
import WallEntity from '../types/WallEntity';

/**
 * Given a target vertex:
 *  1. Delete all vertices that exist at the same position as the target vertex
 *  2. Update all walls to connect to the target vertex instead of the conflicting vertex
 */
export function mergeVerticesAtVertex(
  state: Draft<RootState>,
  vertexId: string,
  getVerticesAtPoint: (point: Point) => VertexEntity[],
  getWallsAtVertex: (vertexId: string) => WallEntity[],
) {
  const targetVertex = state.vertices[vertexId];

  // Skip if the target vertex does not exist
  if (!targetVertex) return 0;

  const verticesAt = getVerticesAtPoint({ x: targetVertex.x, y: targetVertex.y });

  verticesAt.forEach((vertex) => {
    // Skip the target vertex:
    if (vertex.id === vertexId) return;

    // Reconnect walls to the target vertex:
    getWallsAtVertex(vertex.id).forEach((wall) => {
      if (wall.v1 !== vertexId && wall.v1 === vertex.id) wall.v1 = vertexId;
      if (wall.v2 !== vertexId && wall.v2 === vertex.id) wall.v2 = vertexId;
    });

    // Delete the overlapping vertex:
    delete state.vertices[vertex.id];
  });

  return verticesAt.length;
}
