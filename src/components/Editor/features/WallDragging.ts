import { createAction } from '@reduxjs/toolkit';
import { ReducerBuilder } from '../useEditorState'
import Point from '../../../types/Point'

export const wallDragStart = createAction('wall:drag:start', (index: number) => ({ payload: { index } }));

export const wallDragUpdate = createAction('wall:drag:update', (by: Point) => ({ payload: { by } }));

export const wallDragDrop = createAction('wall:drag:drop');

const wallDraggingReducer: ReducerBuilder = (builder) => {
  let wallIndex: number | undefined;
  let startingPointA: Point | undefined;
  let startingPointB: Point | undefined;

  builder
    .addCase(wallDragStart, (state, { payload }) => {
      if (payload.index === undefined) return;

      state.mode = 'dragging:wall';

      wallIndex = payload.index;
      const { v1, v2 } = state.walls[wallIndex];
      startingPointA = { x: state.vertices[v1].x, y: state.vertices[v1].y };
      startingPointB = { x: state.vertices[v2].x, y: state.vertices[v2].y };

      state.vertices[wallIndex].isDragging = true;
    })
    .addCase(wallDragUpdate, (state, { payload }) => {
      if (state.mode !== 'dragging:wall') return;
      if (wallIndex === undefined) return;
      if (startingPointA === undefined || startingPointB === undefined) return;

      const { v1, v2 } = state.walls[wallIndex];
      state.vertices[v1].x = startingPointA.x + payload.by.x;
      state.vertices[v1].y = startingPointA.y + payload.by.y;
      state.vertices[v2].x = startingPointB.x + payload.by.x;
      state.vertices[v2].y = startingPointB.y + payload.by.y;
    })
    .addCase(wallDragDrop, (state) => {
      if (state.mode !== 'dragging:wall') return;

      if (wallIndex !== undefined) {
        delete state.vertices[wallIndex].isDragging;
      }

      state.mode = undefined;
      
      wallIndex = undefined;
      startingPointA = undefined;
      startingPointB = undefined;
    });
};

export default wallDraggingReducer;
