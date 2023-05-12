import { createSelector } from "@reduxjs/toolkit"
import RootState from "../types/RootState"
import WallEntity from "../types/WallEntity"

export const getVertexToWallLookup = createSelector(
  (state: RootState) => state.walls,
  (walls) => {
    const adj = Object.values(walls).reduce((adj, wall) => {
      if (!adj[wall.v1]) adj[wall.v1] = [];
      if (!adj[wall.v2]) adj[wall.v2] = [];

      adj[wall.v1].push(wall);
      adj[wall.v2].push(wall);

      return adj;
    }, {} as Record<string, WallEntity[]>);

    return (vertexId: string) => adj[vertexId] || [];
  }
);
