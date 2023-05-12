import { createAction } from '@reduxjs/toolkit';
import { createFeature } from '../utils/toolkit';
import { EDITOR_MODES } from '../constants';
import { getSelectedWalls, getUniqueVerticesFromSelectedWalls } from '../selectors/walls';
import { getVertexToWallLookup } from '../selectors/getVertexToWallLookup';
import { deleteWall } from '../helpers/deleteWall';
import { historyPushEntry } from '../helpers/historyPushEntry'

/**
 * 
 */
export const wallSelectStart =
  createAction('wall:select:start', (id: string) => ({ payload: { id } }));

/**
 * 
 */
export const wallSelectSwitch =
  createAction('wall:select:switch', (id: string) => ({ payload: { id } }));

/**
 * 
 */  
export const wallSelectMove =
  createAction('wall:select:move', (dx: number, dy: number) => ({ payload: { dx, dy } }));

/**
 * 
 */  
export const wallSelectDelete =
  createAction('wall:select:delete');

/**
 * 
 */  
export const wallSelectStop =
  createAction('wall:select:stop');

export default createFeature((builder) => {
  builder
    .addCase(wallSelectStart, (state, { payload: { id } }) => {
      if (state.mode !== EDITOR_MODES.NONE) return;

      // Flag the wall as selected to trigger a UI update:
      state.walls[id].isSelected = true;

      // Start wall selection mode:
      state.mode = EDITOR_MODES.SELECTING_WALL;
    })
    .addCase(wallSelectSwitch, (state, { payload: { id } }) => {
      if (state.mode !== EDITOR_MODES.SELECTING_WALL) return;

      getSelectedWalls(state).forEach((wall) => {
        // Remove the selected flag from all previously selected walls:
        delete state.walls[wall.id].isSelected;
      });

      // Select the new wall to trigger a UI update:
      state.walls[id].isSelected = true;
    })
    .addCase(wallSelectMove, (state, { payload: { dx, dy } }) => {
      if (state.mode !== EDITOR_MODES.SELECTING_WALL) return;

      // If 2+ selected walls connect to the same vertex, we need to make sure to
      // only move the vertex once, hence why we need to select the unique vertices:
      getUniqueVerticesFromSelectedWalls(state).forEach(({ id }) => {
        state.vertices[id].x += dx;
        state.vertices[id].y += dy;
      });

      historyPushEntry(state);
    })
    .addCase(wallSelectDelete, (state) => {
      if (state.mode !== EDITOR_MODES.SELECTING_WALL) return;

      const getWallsAt = getVertexToWallLookup(state);

      getSelectedWalls(state).forEach(({ id }) => {
        deleteWall(state, id, getWallsAt);
      });

      // Exit wall selection mode as the selected wall has been deleted:
      state.mode = EDITOR_MODES.NONE;

      historyPushEntry(state);
    })
    .addCase(wallSelectStop, (state) => {
      if (state.mode !== EDITOR_MODES.SELECTING_WALL) return;

      getSelectedWalls(state).forEach(({ id }) => {
        delete state.walls[id].isSelected;
      });

      state.mode = EDITOR_MODES.NONE;
    });
});
