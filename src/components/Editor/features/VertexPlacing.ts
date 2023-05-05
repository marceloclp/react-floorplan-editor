import { createAction } from '@reduxjs/toolkit';
import { ReducerBuilder, createTarget } from '../useEditorState'
import Point from '../../../types/Point'
import AdjacencyMatrix from '../helpers/AdjacencyMatrix'

export const vertexPlaceStart = createAction('vertex:place:start', (point: Point) => ({ payload: { point } }));

export const vertexPlaceUpdate = createAction('vertex:place:update', (point: Point) => ({ payload: { point } }));

/**
 * 1. Fixes the temporary vertex.
 * 2. Switches to wall placing mode.
 */
export const vertexPlaceClick = createAction('vertex:place:click');

export const vertexPlaceStop = createAction('vertex:place:stop');

const vertexPlacingReducer: ReducerBuilder = (builder, refs) => {
  builder
    .addCase(vertexPlaceStart, (state, { payload }) => {
      state.mode = 'placing:vertex';

      const { x, y } = payload.point;

      // Initialize the temporary vertex:
      state.vertices.push({ x, y, isPlacing: true });
    })
    .addCase(vertexPlaceUpdate, (state, { payload }) => {
      if (state.mode !== 'placing:vertex') return;

      const vIndex = state.vertices.length - 1;
      state.vertices[vIndex].x = payload.point.x;
      state.vertices[vIndex].y = payload.point.y;
    })
    .addCase(vertexPlaceClick, (state) => {
      if (state.mode !== 'placing:vertex') return;

      let vIndex = state.vertices.length - 1;
      const { x, y } = state.vertices[vIndex];

      // If the new vertex is placed on top of an existing vertex, merge them.
      const verticesAtPoint = new AdjacencyMatrix(state)
        .verticesAtPoint({ x, y })
        .filter((vertexIndex) => vertexIndex !== vIndex);

      if (verticesAtPoint.length > 0) {
        state.vertices.splice(vIndex, 1);
        vIndex = verticesAtPoint[0];
      } else {
        delete state.vertices[vIndex].isPlacing;
      }

      // Pipe a reference to the placed vertex to wall placing mode.
      refs.target = createTarget('vertex', vIndex);

      state.mode = 'placing:wall';
    })
    .addCase(vertexPlaceStop, (state) => {
      if (state.mode !== 'placing:vertex') return;

      // Remove any temporary vertices and walls we have placed:
      state.vertices = state.vertices.filter(({ isPlacing }) => !isPlacing);

      state.mode = undefined;
    });
};

export default vertexPlacingReducer;
