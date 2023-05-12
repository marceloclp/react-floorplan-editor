import { createSelector } from '@reduxjs/toolkit';
import RootState from '../types/RootState';

export const selectZoomLevel = createSelector(
  (state: RootState) => state.zooming,
  (zooming) => zooming.zoom,
);
