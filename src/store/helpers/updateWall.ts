import { Draft } from '@reduxjs/toolkit';
import RootState from '../types/RootState';
import WallEntity from '../types/WallEntity';

export const updateWall =
  (state: Draft<RootState>, wallId: string, partial: Partial<WallEntity>) => {
    Object.keys(partial).forEach((key) => {
      const k = key as keyof WallEntity;
      if (k.startsWith('is') && partial[k] === false)
        delete state.walls[wallId][k];
      else state.walls[wallId][k] = partial[k];
    });
    return state.walls[wallId];
  };
