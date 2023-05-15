import { createAction } from '@reduxjs/toolkit';
import { createFeature, snapshotable } from '../utils/toolkit';
import { EDITOR_MODES } from '../constants';
import Point from '../../types/Point';
import { updateVertex } from '../helpers/updateVertex';
import { updateWall } from '../helpers/updateWall';
import { selectGetVerticesAtPoint, selectGetWallsAtVertex } from '../selectors/lookups';
import { mergeVerticesAtVertex } from '../helpers/mergeVerticesAtVertex';
import { mergeWallsAtWall } from '../helpers/mergeWallsAtWall';

/**
 * 
 */
export const wallDragStart = createAction('wall:drag:start', (id: string) => ({ payload: { id } }));

/**
 * 
 */
export const wallDragUpdate = createAction('wall:drag:update', (by: Point) => ({ payload: { dx: by.x, dy: by.y } }));

/**
 * 
 */
export const wallDragDrop = createAction('wall:drag:drop', () => snapshotable());

export default createFeature((builder) => {
  let pointA: Point = { x: 0, y: 0 };
  let pointB: Point = { x: 0, y: 0 };

  builder
    .addCase(wallDragStart, (state, { payload: { id } }) => {
      if (state.mode !== EDITOR_MODES.NONE) return;

      const { v1, v2 } = updateWall(state, id, { isDragging: true });

      const vertexA = updateVertex(state, v1, { isDragging: true });
      const vertexB = updateVertex(state, v2, { isDragging: true });

      pointA = { x: vertexA.x, y: vertexA.y };
      pointB = { x: vertexB.x, y: vertexB.y };

      // Save a reference to the selected wall:
      state.targetId = id;

      state.mode = EDITOR_MODES.DRAGGING_WALL;
    })
    .addCase(wallDragUpdate, (state, { type, payload: { dx, dy } }) => {
      if (state.mode !== EDITOR_MODES.DRAGGING_WALL) return;

      if (!state.targetId)
        throw new Error(`Expected to have a selected wall at [${type}]`);

      const { v1, v2 } = state.walls[state.targetId];

      // Update the vertices' positions:
      updateVertex(state, v1, { x: pointA.x + dx, y: pointA.y + dy });
      updateVertex(state, v2, { x: pointB.x + dx, y: pointB.y + dy });
    })
    .addCase(wallDragDrop, (state, { type }) => {
      if (state.mode !== EDITOR_MODES.DRAGGING_WALL) return;

      if (!state.targetId)
        throw new Error(`Expected to have a selected wall at [${type}]`);

      const { v1, v2 } = state.walls[state.targetId];

      const getVerticesAtPoint = selectGetVerticesAtPoint(state);
      const getWallsAtVertex   = selectGetWallsAtVertex(state);

      // Remove dragging flag from wall and vertices:
      updateWall(state, state.targetId, { isDragging: false });
      updateVertex(state, v1, { isDragging: false });
      updateVertex(state, v2, { isDragging: false });

      // Merge overlapping vertices:
      mergeVerticesAtVertex(state, v1, getVerticesAtPoint, getWallsAtVertex);
      mergeVerticesAtVertex(state, v2, getVerticesAtPoint, getWallsAtVertex);

      // Merge overlapping walls at the dragged wall:
      mergeWallsAtWall(state, state.targetId, getWallsAtVertex);

      // Exit wall dragging mode:
      state.mode = EDITOR_MODES.NONE;
    });
});
