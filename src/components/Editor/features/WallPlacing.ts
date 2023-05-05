import { createAction } from '@reduxjs/toolkit';
import Point from '../../../types/Point'
import AdjacencyMatrix from '../helpers/AdjacencyMatrix'
import createFeature from '../utils/createFeature'

export const wallPlaceUpdate = createAction('wall:place:update', (point: Point) => ({ payload: { point } }));

export const wallPlaceClick = createAction('wall:place:click');

export const wallPlaceStop = createAction('wall:place:stop');

export default createFeature((builder, refs) => {
  builder
    .addCase(wallPlaceUpdate, (state, { payload }) => {
      if (state.mode !== 'placing:wall') return;

      const { x, y } = payload.point;

      // Called only on the first update tick
      // Initialize the temporary vertex and walls:
      if (!state.walls.at(-1)?.isPlacing) {
        const v1 = refs.target?.index!;
        
        // Place a temporary vertex to draw the wall from v1 to v2:
        const v2 = state.vertices.push({ x, y, isPlacing: true }) - 1;

        // Initialize the temporary wall:
        state.walls.push({ v1, v2, isPlacing: true });
      }

      // To update the wall, we actually just need to update the head vertex.
      // The head vertex is the temporary vertex we created:
      const { v2 } = state.walls.at(-1)!;
      state.vertices[v2].x = x;
      state.vertices[v2].y = y;
    })
    .addCase(wallPlaceClick, (state) => {
      if (state.mode !== 'placing:wall') return;

      // Get the coordinates of the head vertex:
      const wIndex = state.walls.length - 1;
      const vHead = state.vertices.length - 1;
      const { x, y } = state.vertices[vHead];

      // If the head vertex is placed on top of an existing vertex, merge them.
      const verticesAtHead = new AdjacencyMatrix(state)
        .verticesAtPoint({ x, y })
        .filter((vertexIndex) => vertexIndex !== vHead);

      if (verticesAtHead.length > 0) {
        // Merge temporary vertex into existing vertex at head point:
        state.walls[wIndex].v2 = verticesAtHead[0];
        state.vertices.splice(vHead, 1);
      } else {
        // Fix the temporary vertex:
        delete state.vertices[vHead].isPlacing;
      }

      // Fix the temporary wall:
      delete state.walls[wIndex].isPlacing;

      // Use the current head as the next tail:
      const vTail = state.walls[wIndex].v2;

      // Prepare the next temporary wall and vertex:
      const vHeadNext = state.vertices.push({ x, y, isPlacing: true }) - 1;
      state.walls.push({ v1: vTail, v2: vHeadNext, isPlacing: true });
    })
    .addCase(wallPlaceStop, (state) => {
      if (state.mode !== 'placing:wall') return;

      // Remove any temporary vertices and walls we have placed:
      state.vertices = state.vertices.filter(({ isPlacing }) => !isPlacing);
      state.walls = state.walls.filter(({ isPlacing }) => !isPlacing);

      state.mode = undefined;
    });
});
