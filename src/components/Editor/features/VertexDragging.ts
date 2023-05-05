import { createAction } from '@reduxjs/toolkit';
import { ReducerBuilder } from '../useEditorState'
import Point from '../../../types/Point'

/** Initializes vertex drag mode. */
export const vertexDragStart = createAction('vertex:drag:start', (index: number) => ({ payload: { index } }));

/** Updates the position of the temporary vertex. */
export const vertexDragUpdate = createAction('vertex:drag:update', (by: Point) => ({ payload: { by } }));

/** Places the dragged vertex and exits vertex drag mode. */
export const vertexDragDrop = createAction('vertex:drag:drop');

/** Exits vertex drag mode without placing the dragged vertex. */
export const vertexDragCancel = createAction('vertex:drag:cancel');

const vertexDraggingReducer: ReducerBuilder = (builder) => {
  let startingPoint: Point | undefined;

  builder
    .addCase(vertexDragStart, (state, { payload }) => {
      if (state.mode !== undefined) return;

      state.mode = 'dragging:vertex';

      const vertex = state.vertices[payload.index];
      vertex.isDragging = true;

      startingPoint = { x: vertex.x, y: vertex.y };
    })
    .addCase(vertexDragUpdate, (state, { payload }) => {
      if (state.mode !== 'dragging:vertex') return;

      const vertex = state.vertices.find(({ isDragging }) => isDragging);

      if (vertex && startingPoint) {
        vertex.x = startingPoint.x + payload.by.x;
        vertex.y = startingPoint.y + payload.by.y;
      }
    })
    .addCase(vertexDragDrop, (state) => {
      if (state.mode !== 'dragging:vertex') return;

      const index = state.vertices.findIndex(({ isDragging }) => isDragging);
      const vertex = state.vertices[index];

      // Case 1: vertex is dropped onto an empty grid space
      delete vertex.isDragging;

      // Case 2 (TODO): vertex is dropped on top of another vertex, merge them:

      state.mode = undefined;
    })
    .addCase(vertexDragCancel, (state) => {
      // TODO: call this when window onfocus happens
      if (state.mode !== 'dragging:vertex') return;

      const vertex = state.vertices.find(({ isDragging }) => isDragging);

      if (vertex && startingPoint) {
        // Restore the vertex to its initial state:
        vertex.x = startingPoint.x;
        vertex.y = startingPoint.y;
        delete vertex.isDragging;
      }

      state.mode = undefined;
    });
};

export default vertexDraggingReducer;