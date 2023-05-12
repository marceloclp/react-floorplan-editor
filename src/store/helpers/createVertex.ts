import { Draft, nanoid } from '@reduxjs/toolkit';
import RootState from '../types/RootState';
import VertexEntity from '../types/VertexEntity';

type CreateVertexEntity = Pick<VertexEntity, 'x' | 'y'> & Partial<VertexEntity>;

export const createVertex =
  (state: Draft<RootState>, partial: CreateVertexEntity) => {
    const id = nanoid();
    state.vertices[id] = { id, ...partial };
    return state.vertices[id];
  };
