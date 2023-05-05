import { createAction } from '@reduxjs/toolkit';
import Point from '../../../types/Point'
import { EditorState, createTarget } from '../useEditorState'
import findColinearPoint from '../../../utils/findColinearPoint'
import createFeature from '../utils/createFeature'

/**
 * Starts wall splitting mode from vertex placing mode.
 */
export const wallSplitStart = createAction('wall:split:start', (index: number, point: Point) => ({ payload: { index, point } }));

export const wallSplitUpdateOnWall = createAction('wall:split:update_on_wall', (index: number, point: Point) => ({ payload: { index, point } }));

export const wallSplitUpdateOnGrid = createAction('wall:split:update_on_grid', (point: Point) => ({ payload: { point } }));

export const wallSplitClick = createAction('wall:split:click');

export const wallSplitStop = createAction('wall:split:stop');

export default createFeature((builder, refs) => {
  const getSplitTargetIndex = (state: EditorState) =>
    state.walls.findIndex(({ isSplitTarget }) => isSplitTarget);

  builder
    .addCase(wallSplitStart, (state, { payload }) => {
      if (state.mode !== 'placing:vertex') return;

      // Remove the temporary vertex from the vertex placing mode:
      state.vertices = state.vertices.filter(({ isPlacing }) => !isPlacing);

      // Initialize split vertex placing mode:
      state.mode = 'placing:split_vertex';

      const { index, point } = payload;
      state.walls[index].isSplitTarget = true;

      // Store a reference to the tails of the temporary walls:
      const { v1, v2 } = state.walls[index];

      // Initialize the temporary vertex:
      const v3 = state.vertices.push({ x: point.x, y: point.y, isSplitting: true }) - 1;

      // Initialize the temporary walls:
      state.walls.push({ v1: v1, v2: v3, isSplitting: true });
      state.walls.push({ v1: v2, v2: v3, isSplitting: true });
    })
    .addCase(wallSplitUpdateOnWall, (state, { payload }) => {
      if (state.mode !== 'placing:split_vertex') return;

      const { index, point } = payload;

      const prevTargetWallIndex = getSplitTargetIndex(state);
      if (index !== prevTargetWallIndex) {
        // The target wall has changed
        
        // Change the split target flag
        delete state.walls[prevTargetWallIndex].isSplitTarget;
        state.walls[index].isSplitTarget = true;

        // Switch the tail vertices of the temporary walls:
        const { v1: nextTailV1, v2: nextTailV2 } = state.walls[index];
        state.walls[state.walls.length - 2].v1 = nextTailV1;
        state.walls[state.walls.length - 1].v1 = nextTailV2;
      }

      // Find a new point colinear to the target wall:
      const { v1, v2 } = state.walls[index];
      const A = state.vertices[v1];
      const B = state.vertices[v2];
      const C = findColinearPoint(A, B, point);

      // Place the split vertex colinear to the target wall:
      const vIndex = state.vertices.length - 1;
      state.vertices[vIndex].x = C.x;
      state.vertices[vIndex].y = C.y;
    })
    .addCase(wallSplitUpdateOnGrid, (state, { payload }) => {
      if (state.mode !== 'placing:split_vertex') return;
      // console.log('update on grid')

      const { point } = payload;

      // Update the position of the split vertex:
      const vIndex = state.vertices.length - 1;
      state.vertices[vIndex].x = point.x;
      state.vertices[vIndex].y = point.y;
    })
    .addCase(wallSplitClick, (state) => {
      if (state.mode !== 'placing:split_vertex') return;

      // Fix the temporary vertex:
      const vIndex = state.vertices.length - 1;
      delete state.vertices[vIndex].isSplitting;

      // Fix the temporary walls:
      delete state.walls[state.walls.length - 1].isSplitting;
      delete state.walls[state.walls.length - 2].isSplitting;

      // Remove the split target flag:
      const targetIndex = getSplitTargetIndex(state);
      delete state.walls[targetIndex].isSplitTarget;

      // Pipe to wall placing mode:
      state.mode = 'placing:wall';

      // Add a reference to the split vertex for wall placing mode:
      refs.target = createTarget('vertex', vIndex);
    })
    .addCase(wallSplitStop, (state) => {
      if (state.mode !== 'placing:split_vertex') return;

      // Delete the temporary split vertex:
      state.vertices.splice(state.vertices.length - 1);

      // Delete the temporary walls:
      state.walls.splice(state.walls.length - 2);

      state.mode = undefined;
    });
});
