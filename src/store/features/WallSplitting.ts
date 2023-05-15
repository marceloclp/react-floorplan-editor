import { createAction } from '@reduxjs/toolkit';
import Point from '../../types/Point';
import findColinearPoint from '../../utils/findColinearPoint';
import { EDITOR_MODES } from '../constants';
import { createWall } from '../helpers/createWall';
import { mergeVerticesAtVertex } from '../helpers/mergeVerticesAtVertex';
import { mergeWallsAtWall } from '../helpers/mergeWallsAtWall';
import { updateVertex } from '../helpers/updateVertex';
import { updateWall } from '../helpers/updateWall';
import { selectGetVerticesAtPoint, selectGetWallsAtVertex } from '../selectors/lookups';
import { getSplitTargetWall, getSplittingWalls } from '../selectors/walls';
import { createFeature, snapshotable } from '../utils/toolkit';

/**
 * Wall splitting branches off from vertex placing mode when the user hovers
 * over a wall.
 */
export const wallSplitStart =
  createAction('wall:split:start', (id: string, point: Point) => ({ payload: { id, point } }));

/**
 * 
 */
export const wallSplitUpdateOnWall =
  createAction('wall:split:update_on_wall', (id: string, point: Point) => ({ payload: { id, point } }));

/**
 * 
 */
export const wallSplitUpdateOnGrid =
  createAction('wall:split:update_on_grid', (point: Point) => ({ payload: { point } }));

/**
 * 
 */
export const wallSplitClick =
  createAction('wall:split:click', () => snapshotable());

/**
 * 
 */
export const wallSplitStop =
  createAction('wall:split:stop');

export default createFeature((builder) => {
  builder
    .addCase(wallSplitStart, (state, { type, payload: { id, point } }) => {
      if (state.mode !== EDITOR_MODES.PLACING_VERTEX) return;

      if (!state.targetId || !state.vertices[state.targetId])
          throw new Error(`Expected vertex from vertex placing mode at [${type}]`);

      // Because wall splitting mode branches of from vertex placing mode, we
      // can reuse the vertex that was being placed. To do that we need to first
      // remove the `isPlacing` flag.
      const head = updateVertex(state, state.targetId, { isPlacing: false, isSplitting: true });

      // Set the split target flag to trigger a UI update:
      const { v1, v2 } = updateWall(state, id, { isSplitTarget: true });

      const A = state.vertices[v1];
      const B = state.vertices[v2];
      const { x, y } = findColinearPoint(A, B, point);

      head.x = x;
      head.y = y;

      // Create the walls connecting from the the head/tail of the target wall
      // to the head vertex:
      createWall(state, { v1: v1, v2: head.id, isSplitting: true });
      createWall(state, { v1: v2, v2: head.id, isSplitting: true });

      // Initialize wall splitting mode:
      state.mode = EDITOR_MODES.SPLITTING_WALL;
    })
    .addCase(wallSplitUpdateOnWall, (state, { payload: { id, point } }) => {
      if (state.mode !== EDITOR_MODES.SPLITTING_WALL) return;

      // Remove split target flag from the previous target wall:
      delete getSplitTargetWall(state)?.isSplitTarget;

      // Flag the next target wall to trigger a UI update:
      const { v1, v2 } = updateWall(state, id, { isSplitTarget: true });
      const A = state.vertices[v1];
      const B = state.vertices[v2];

      const [wallA, wallB] = getSplittingWalls(state);

      // Update the walls's tails to match the new target wall:
      updateWall(state, wallA.id, { v1: v1 });
      updateWall(state, wallB.id, { v1: v2 });

      // Position the head vertex colinear to the new target wall:
      updateVertex(state, state.targetId!, findColinearPoint(A, B, point));
    })
    .addCase(wallSplitUpdateOnGrid, (state, { type, payload: { point} }) => {
      if (state.mode !== EDITOR_MODES.SPLITTING_WALL) return;

      if (!state.targetId || !state.vertices[state.targetId])
        throw new Error(`Expected head vertex at [${type}]`);

      updateVertex(state, state.targetId, point);
    })
    .addCase(wallSplitClick, (state, { type }) => {
      if (state.mode !== EDITOR_MODES.SPLITTING_WALL) return;

      if (!state.targetId || !state.vertices[state.targetId])
        throw new Error(`Expected head vertex at [${type}]`);

      const getVerticesAtPoint = selectGetVerticesAtPoint(state);
      const getWallsAtVertex   = selectGetWallsAtVertex(state);

      // Merge overlapping vertices:
      mergeVerticesAtVertex(state, state.targetId, getVerticesAtPoint, getWallsAtVertex);

      // Merge overlapping walls:
      getSplittingWalls(state).forEach((wall) => {
        mergeWallsAtWall(state, wall.id, getWallsAtVertex);
        updateWall(state, wall.id, { isSplitting: false });
      });

      updateVertex(state, state.targetId, { isSplitting: false });

      // Delete the target wall:
      if (getSplitTargetWall(state))
        delete state.walls[getSplitTargetWall(state)!.id];

      // Start wall placing mode:
      state.mode = EDITOR_MODES.PLACING_WALL;
    })
    .addCase(wallSplitStop, (state) => {
      if (state.mode !== EDITOR_MODES.SPLITTING_WALL) return;

      if (state.targetId)
        delete state.vertices[state.targetId];
      getSplittingWalls(state).forEach((wall) => {
        delete state.walls[wall.id];
      });

      delete getSplitTargetWall(state)?.isSplitTarget;

      state.mode = EDITOR_MODES.NONE;
    });
});