import { createAction } from '@reduxjs/toolkit';
import { createFeature } from '../utils/toolkit';
import { EDITOR_MODES } from '../constants';

/**
 * 
 */
export const panStart =
  createAction('pan:start', (isDragging: boolean) => ({ payload: { isDragging } }));

/**
 * 
 */
export const panUpdate =
  createAction('pan:update', (dx: number, dy: number) => ({ payload: { dx, dy } }));

/**
 * 
 */
export const panStop =
  createAction('pan:stop');

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default createFeature((builder) => {
  builder
    .addCase(panStart, (state, { payload: { isDragging } }) => {
      if (state.mode !== EDITOR_MODES.NONE) return;

      if (isDragging) state.panning.isDragPanning = true;
      else state.panning.isTwoFingersPanning = true;

      state.mode = EDITOR_MODES.PANNING;
    })
    .addCase(panUpdate, (state, { payload: { dx, dy } }) => {
      if (state.mode !== EDITOR_MODES.PANNING) return;

      const { panX, panY, maxPanX, maxPanY } = state.panning;

      state.panning.panX = clamp(panX + dx, -maxPanX, maxPanX);
      state.panning.panY = clamp(panY + dy, -maxPanY, maxPanY);
    })
    .addCase(panStop, (state) => {
      if (state.mode !== EDITOR_MODES.PANNING) return;

      state.panning.isDragPanning = false;
      state.panning.isTwoFingersPanning = false;

      state.mode = EDITOR_MODES.NONE;
    });
});