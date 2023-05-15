import { createAction } from '@reduxjs/toolkit';
import { EDITOR_MODES } from '../constants';
import { deleteVertex } from '../helpers/deleteVertex';
import { getSelectedVertices } from '../selectors/vertices';
import { createFeature, snapshotable } from '../utils/toolkit';

/**
 * 
 */
export const vertexSelectStart =
  createAction('vertex:select:start', (id: string) => ({ payload: { id } }));

/**
 * 
 */
export const vertexSelectSwitch =
  createAction('vertex:select:switch', (id: string) => ({ payload: { id } }));

/**
 * 
 */
export const vertexSelectMove =
  createAction('vertex:select:move', (dx: number, dy: number) => snapshotable({ payload: { dx, dy } }));

/**
 * 
 */
export const vertexSelectDelete =
  createAction('vertex:select:delete', () => snapshotable());

/**
 * 
 */  
export const vertexSelectStop =
  createAction('vertex:select:stop');

export default createFeature((builder) => {
  builder
    .addCase(vertexSelectStart, (state, { payload: { id } }) => {
      if (state.mode !== EDITOR_MODES.NONE) return;

      // Flag the selected vertex as selected to trigger a UI update:
      state.vertices[id].isSelected = true;

      // Initialize vertex selecting mode:
      state.mode = EDITOR_MODES.SELECTING_VERTEX;
    })
    .addCase(vertexSelectSwitch, (state, { payload: { id } }) => {
      if (state.mode !== EDITOR_MODES.SELECTING_VERTEX) return;

      getSelectedVertices(state).forEach((vertex) => {
        // Remove the selected flag from all previously selected vertices:
        delete vertex.isSelected;
      });

      // Select the new vertex to trigger a UI update:
      state.vertices[id].isSelected = true;
    })
    .addCase(vertexSelectMove, (state, { payload: { dx, dy } }) => {
      if (state.mode !== EDITOR_MODES.SELECTING_VERTEX) return;

      getSelectedVertices(state).forEach((vertex) => {
        vertex.x += dx;
        vertex.y += dy;
      });
    })
    .addCase(vertexSelectDelete, (state) => {
      if (state.mode !== EDITOR_MODES.SELECTING_VERTEX) return;

      getSelectedVertices(state).forEach((vertex) => {
        // Delete the selected vertices and all walls connected to them:
        deleteVertex(state, vertex.id);
      });
      
      // Exit vertex selection mode as the vertex no longer exists:
      state.mode = EDITOR_MODES.NONE;
    })
    .addCase(vertexSelectStop, (state) => {
      if (state.mode !== EDITOR_MODES.SELECTING_VERTEX) return;

      getSelectedVertices(state).forEach((vertex) => {
        // Remove the selected flag from all vertices:
        delete vertex.isSelected;
      });

      // Exit selection mode:
      state.mode = EDITOR_MODES.NONE;
    });
});
