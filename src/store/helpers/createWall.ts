import { Draft, nanoid } from '@reduxjs/toolkit';
import RootState from '../types/RootState';
import WallEntity from '../types/WallEntity';

type CreateWallEntity = Pick<WallEntity, 'v1' | 'v2'> & Partial<WallEntity>

export const createWall =
  (state: Draft<RootState>, partial: CreateWallEntity) => {
    const id = nanoid();
    state.walls[id] = { id, ...partial };
    return state.walls[id];
  };
  