import { createSelector } from '@reduxjs/toolkit';
import { lineAngle } from 'geometric';
import { selectGetWallsAtVertex } from './lookups';
import Point from '../../types/Point';
import RootState from '../types/RootState';
import WallEntity from '../types/WallEntity';

type Angle = { x0: number; x1: number; x2: number; y0: number; y1: number; y2: number };

const getConnectedVertices = (vertexId: string, walls: WallEntity[]) => {
  const lookup = walls
    .reduce((obj, { v1, v2 }) => {
      return { ...obj, [v1]: true, [v2]: true };
    }, {} as Record<string, boolean>);
  
  // Delete the center vertex:
  delete lookup[vertexId];

  return Object.keys(lookup);
};

const getLineAngle = (A: Point, B: Point) =>
  lineAngle([[A.x, A.y], [B.x, B.y]]);

export const selectAngles = createSelector(
  (state: RootState) => state.vertices,
  selectGetWallsAtVertex,
  (vertices, getWallsAtVertex) => {
    const angles: Angle[] = [];

    Object.values(vertices).forEach(({ x, y, id: idB }) => {
      const connectedVertices = getConnectedVertices(idB, getWallsAtVertex(idB));

      // We need at least two vertices to draw an angle:
      if (connectedVertices.length <= 1) return;

      connectedVertices.sort((idA, idC) => {
        const angleA = getLineAngle(vertices[idB], vertices[idA]);
        const angleC = getLineAngle(vertices[idB], vertices[idC]);

        if (angleA > angleC) return 1;
        if (angleA < angleC) return -1;
        return 0;
      });

      // console.table(
      //   connectedVertices
      //     .map((id) => vertices[id])
      //     .map(({ x, y }) => ({ '(x, y)': `(${x}, ${y})`, angle: getLineAngle(vertices[idB], {x,y})})),
      // );

      for (let i = 0; i < connectedVertices.length - 1; i++) {
        const { x: x0, y: y0 } = vertices[connectedVertices[i]];
        const { x: x1, y: y1 } = vertices[idB];
        const { x: x2, y: y2 } = vertices[connectedVertices[i+1]];

        angles.push({ x0, y0, x1, y1, x2, y2 });
      }
    });

    return angles;
  },
);
