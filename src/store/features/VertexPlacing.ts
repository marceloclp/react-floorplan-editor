import { createAction } from '@reduxjs/toolkit';
import Point from '../../types/Point';
import { EDITOR_MODES } from '../constants';
import { createVertex } from '../helpers/createVertex';
import { mergeVerticesAtVertex } from '../helpers/mergeVerticesAtVertex';
import { updateVertex } from '../helpers/updateVertex';
import { selectGetVerticesAtPoint, selectGetWallsAtVertex } from '../selectors/lookups';
import { createFeature, snapshotable } from '../utils/toolkit';

/**
 * 
 */
export const vertexPlaceStart =
  createAction('vertex:place:start', (point: Point) => ({ payload: { point } }));

/**
 * 
 */
export const vertexPlaceUpdate =
  createAction('vertex:place:update', (point: Point) => ({ payload: { point } }));

/**
 * 1. Fixes the temporary vertex.
 * 2. Switches to wall placing mode.
 */
export const vertexPlaceClick =
  createAction('vertex:place:click', () => snapshotable());

/**
 * 
 */
export const vertexPlaceStop =
  createAction('vertex:place:stop');

export default createFeature((builder) => {
  builder
    .addCase(vertexPlaceStart, (state, { payload: { point: { x, y } } }) => {
      if (state.mode !== EDITOR_MODES.NONE) return;

      const vertex = createVertex(state, { x, y, isPlacing: true });
      state.targetId = vertex.id;

      state.mode = EDITOR_MODES.PLACING_VERTEX;
    })
    .addCase(vertexPlaceUpdate, (state, { type, payload: { point: { x, y } } }) => {
      if (state.mode !== EDITOR_MODES.PLACING_VERTEX) return;

      if (!state.targetId)
        throw new Error(`Expected to have a placing vertex at [${type}]`);

      updateVertex(state, state.targetId, { x, y });
    })
    .addCase(vertexPlaceClick, (state, { type }) => {
      if (state.mode !== EDITOR_MODES.PLACING_VERTEX) return;

      if (!state.targetId)
        throw new Error(`Expected to have a placing vertex at [${type}]`);

      const getVerticesAtPoint = selectGetVerticesAtPoint(state);
      const getWallsAtVertex   = selectGetWallsAtVertex(state);

      // Merge overlapping vertices:
      mergeVerticesAtVertex(state, state.targetId, getVerticesAtPoint, getWallsAtVertex);

      // Remove placing flag:
      updateVertex(state, state.targetId, { isPlacing: false });

      // Start wall placing mode:
      state.mode = EDITOR_MODES.PLACING_WALL;
    })
    .addCase(vertexPlaceStop, (state, { type }) => {
      if (state.mode !== EDITOR_MODES.PLACING_VERTEX) return;

      if (!state.targetId)
        throw new Error(`Expected to have a placing vertex at [${type}]`);

      // Delete temporary placing vertex:
      delete state.vertices[state.targetId];

      state.mode = EDITOR_MODES.NONE;
    });
});
