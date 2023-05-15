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
      history: [{ vertices: initialState.vertices, walls: initialState.walls }],
      currentIndex: 0,
      undoStack: [{ vertices: initialState.vertices, walls: initialState.walls }],
    },
  }), (builder) => {
    features.forEach((createFeature) => createFeature(builder));
  });
}

type UntypedAction<P = void, M = never, E = never> =
  { payload: P; }
  & ([M] extends [never] ? {} : { meta: M })
  & ([E] extends [never] ? {} : { error: E });

export function snapshotable(): UntypedAction<void, { snapshotable: true }>;
export function snapshotable<P = void, M = never, E = never>(action: UntypedAction<P, M, E>): UntypedAction<P, M & { snapshotable: true }, E>;
export function snapshotable<P = void, M = never, E = never>(action?: UntypedAction<P, M, E>): UntypedAction<P, M & { snapshotable: true }, E> {
  return { ...action, meta: { ...action?.meta, snapshotable: true } } as any;
}
