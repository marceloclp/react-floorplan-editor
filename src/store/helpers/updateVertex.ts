import { Draft } from '@reduxjs/toolkit';
import RootState from '../types/RootState';
import VertexEntity from '../types/VertexEntity';

export const updateVertex =
  (state: Draft<RootState>, vertexId: string, partial: Partial<VertexEntity>) => {
    Object.keys(partial).forEach((key) => {
      const k = key as keyof VertexEntity;
      if (k.startsWith('is') && partial[k] === false)
        delete state.vertices[vertexId][k];
      // @ts-expect-error
      else state.vertices[vertexId][k] = partial[k];
    });
    return state.vertices[vertexId];
  };
