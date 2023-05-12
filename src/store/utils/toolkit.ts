import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import RootState from '../types/RootState';

type FeatureBuilder = (builder: ActionReducerMapBuilder<RootState>) => void;

/**
 * Typesafe helper utility used to split reducers. Similar to createSlice but
 * the state of the slice depends on the root state rather than just a small
 * subset.
 */
export function createFeature(builder: FeatureBuilder) {
  return builder;
}

export function combineFeatures(initialState: RootState, features: FeatureBuilder []) {
  return createReducer<RootState>(() => ({
    ...initialState,
    history: {
      ...initialState.history,
      undoStack: [{ vertices: initialState.vertices, walls: initialState.walls }],
    },
  }), (builder) => {
    features.forEach((createFeature) => createFeature(builder));
  });
}
