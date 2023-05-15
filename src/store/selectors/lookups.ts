import { createSelector } from '@reduxjs/toolkit';
import Point from '../../types/Point';
import RootState from '../types/RootState';
import VertexEntity from '../types/VertexEntity';
import WallEntity from '../types/WallEntity';

type PointKey = `${number}__${number}`;
const createPointKey = ({ x, y }: Point): PointKey => `${x}__${y}`;

export const createPointToVertexLookup = createSelector(
  (state: RootState) => state.vertices,
  (vertices) => {
    return Object.values(vertices).reduce((adj, vertex) => {
      const key = createPointKey(vertex);

      if (!adj[key])
        adj[key] = [];
      adj[key].push(vertex);

      return adj;
    }, {} as Record<PointKey, VertexEntity[]>);
  },
);

export const selectGetVerticesAtPoint = createSelector(
  createPointToVertexLookup,
  (lookup) => {
    return (point: Point) => lookup[createPointKey(point)] || []; 
  },
);

export const createVertexToWallLookup = createSelector(
  (state: RootState) => state.walls,
  (walls) => {
    return Object.values(walls).reduce((adj, wall) => {
      if (!adj[wall.v1]) adj[wall.v1] = [];
      if (!adj[wall.v2]) adj[wall.v2] = [];

      adj[wall.v1].push(wall);
      adj[wall.v2].push(wall);

      return adj;
    }, {} as Record<string, WallEntity[]>);
  }
);

export const selectGetWallsAtVertex = createSelector(
  createVertexToWallLookup,
  (lookup) => {
    return (vertexId: string) => lookup[vertexId] || [];
  },
);
