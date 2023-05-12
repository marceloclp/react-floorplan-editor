import { createAction } from '@reduxjs/toolkit';
import { createFeature } from '../utils/toolkit';

/**
 * 
 */
export const zoomChange =
  createAction('zoom:change', (dz: number) => ({ payload: { dz } }));

/**
 * 
 */
export const zoomReset =
  createAction('zoom:reset');

export default createFeature((builder) => {
  builder
    .addCase(zoomChange, (state, { payload: { dz } }) => {
      const { zoom, minZoom, maxZoom } = state.zooming;

      state.zooming.zoom = Math.max(minZoom, Math.min(maxZoom, zoom + dz));
    })
    .addCase(zoomReset, (state) => {
      state.zooming.zoom = 1;
    });
});
