import { createAction, nanoid } from '@reduxjs/toolkit';
import { createFeature, snapshotable } from '../utils/toolkit';
import { EDITOR_MODES } from '../constants';
import Point from '../../types/Point';
import { updateVertex } from '../helpers/updateVertex';
import { mergeVerticesAtVertex } from '../helpers/mergeVerticesAtVertex';
import { selectGetVerticesAtPoint, selectGetWallsAtVertex } from '../selectors/lookups';
import { mergeWallsAtWall } from '../helpers/mergeWallsAtWall';

/** Initializes vertex drag mode. */
export const vertexDragStart =
  createAction('vertex:drag:start', (id: string) => ({ payload: { id } }));

/** Updates the position of the temporary vertex. */
export const vertexDragUpdate =
  createAction('vertex:drag:update', (by: Point) => ({ payload: { dx: by.x, dy: by.y } }));

/** Places the dragged vertex and exits vertex drag mode. */
export const vertexDragDrop =
  createAction('vertex:drag:drop', () => snapshotable());

/** Exits vertex drag mode without placing the dragged vertex. */
export const vertexDragCancel =
  createAction('vertex:drag:cancel');

export default createFeature((builder) => {
  /** Reference to the selected vertex so we can access it in O(1). */
  let vertexId = nanoid();
  /** Store the initial position of the vertex, as we get the delta x and y. */
  let point: Point = { x: 0, y: 0 };

  builder
    .addCase(vertexDragStart, (state, { payload: { id } }) => {
      if (state.mode !== EDITOR_MODES.NONE) return;

      // Set the dragging flag to trigger a UI update:
      const vertex = updateVertex(state, id, { isDragging: true });

      // Store the initial values so we can compute the vertex position relative
      // to the delta x and y caused by the cursor movement.
      vertexId = vertex.id;
      point = { x: vertex.x, y: vertex.y };

      // Start vertex dragging move:
      state.mode = EDITOR_MODES.DRAGGING_VERTEX;
    })
    .addCase(vertexDragUpdate, (state, { payload: { dx, dy } }) => {
      if (state.mode !== EDITOR_MODES.DRAGGING_VERTEX) return;

      updateVertex(state, vertexId, { x: point.x + dx, y: point.y + dy });
    })
    .addCase(vertexDragDrop, (state) => {
      if (state.mode !== EDITOR_MODES.DRAGGING_VERTEX) return;

      const getVerticesAtPoint = selectGetVerticesAtPoint(state);
      const getWallsAtVertex   = selectGetWallsAtVertex(state);

      // Merge overlapping vertices:
      mergeVerticesAtVertex(state, vertexId, getVerticesAtPoint, getWallsAtVertex);

      // Merge overlapping walls:
      getWallsAtVertex(vertexId).forEach((wall) => {
        mergeWallsAtWall(state, wall.id, getWallsAtVertex);
      });

      // Remove vertex the dragging flag:
      updateVertex(state, vertexId, { isDragging: false });

      // Exit dragging mode:
      state.mode = EDITOR_MODES.NONE;
    })
    .addCase(vertexDragCancel, (state) => {
      if (state.mode !== EDITOR_MODES.DRAGGING_VERTEX) return;

      // Reset the vertex back to its initial state:
      updateVertex(state, vertexId, { x: point.x, y: point.y, isDragging: false });

      // Exit vertex dragging mode:
      state.mode = EDITOR_MODES.NONE;
    });
});

