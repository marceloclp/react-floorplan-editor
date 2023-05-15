import { createAction } from '@reduxjs/toolkit';
import Point from '../../types/Point';
import { EDITOR_MODES } from '../constants';
import { createVertex } from '../helpers/createVertex';
import { createWall } from '../helpers/createWall';
import { mergeVerticesAtVertex } from '../helpers/mergeVerticesAtVertex';
import { mergeWallsAtWall } from '../helpers/mergeWallsAtWall';
import { updateVertex } from '../helpers/updateVertex';
import { updateWall } from '../helpers/updateWall';
import { selectGetVerticesAtPoint, selectGetWallsAtVertex } from '../selectors/lookups';
import { createFeature, snapshotable } from '../utils/toolkit';

/**
 * Wall placing/drawing mode always starts from vertex placing mode, that's why
 * it doesn't have a start action.
 * 
 * The wall placing mode uses the previously placed vertex to start drawing a
 * wall. The vertex id can be accessed through `state.targetId`.
 */
export const wallPlaceUpdate =
  createAction('wall:place:update', (point: Point) => ({ payload: { point } }));

export const wallPlaceClick =
  createAction('wall:place:click', () => snapshotable());

export const wallPlaceStop =
  createAction('wall:place:stop');

export default createFeature((builder) => {
  builder
    .addCase(wallPlaceUpdate, (state, { type, payload: { point } }) => {
      if (state.mode !== EDITOR_MODES.PLACING_WALL) return;

      if (!state.placingWallId) {
        if (!state.targetId || !state.vertices[state.targetId])
          throw new Error(`Expected a tail vertex at [${type}]`);

        const tail = state.vertices[state.targetId];

        // Initialize the head vertex:
        const head = createVertex(state, { ...point, isPlacing: true });

        const wall = createWall(state, { v1: tail.id, v2: head.id, isPlacing: true });
        state.placingWallId = wall.id;
      }

      const wallId = state.placingWallId!;
      const { v2 } = state.walls[wallId];

      // Update the position of the head vertex
      // This will propagate the changes to the placing wall
      updateVertex(state, v2, point);
    })
    .addCase(wallPlaceClick, (state, { type }) => {
      if (state.mode !== EDITOR_MODES.PLACING_WALL) return;

      if (!state.placingWallId)
        throw new Error(`Expected a placing wall id at [${type}]`);

      const wallId = state.placingWallId!;
      const { v2 } = state.walls[wallId];
      const head   = state.vertices[v2];

      const getVerticesAtPoint = selectGetVerticesAtPoint(state);
      const getWallsAtVertex   = selectGetWallsAtVertex(state);

      // Merge overlapping vertices:
      mergeVerticesAtVertex(state, head.id, getVerticesAtPoint, getWallsAtVertex);

      // Merge overlapping walls:
      mergeWallsAtWall(state, wallId, getWallsAtVertex);

      // Fix the head vertex:
      updateVertex(state, head.id, { isPlacing: false });

      // The next tail becomes the previous head:
      state.targetId = head.id;

      // Fix the wall:
      updateWall(state, wallId, { isPlacing: false });

      // Reset the placing wall id so it creates a new one on update:
      state.placingWallId = undefined;
    })
    .addCase(wallPlaceStop, (state) => {
      if (state.mode !== EDITOR_MODES.PLACING_WALL) return;

      if (state.placingWallId) {
        const { v2 } = state.walls[state.placingWallId];
        delete state.walls[state.placingWallId];
        delete state.vertices[v2];
        state.placingWallId = undefined;
      }

      // Exit wall placing mode:
      state.mode = EDITOR_MODES.NONE;
    });
});
