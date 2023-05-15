import { createAction } from '@reduxjs/toolkit';
import { EditorEntityType } from '../../components/Editor/useEditorState';
import { EDITOR_MODES } from '../constants';
import { deleteVertex } from '../helpers/deleteVertex';
import { deleteWall } from '../helpers/deleteWall';
import { selectGetWallsAtVertex } from '../selectors/lookups';
import { createFeature, snapshotable } from '../utils/toolkit';

/**
 * The entity deletion mode starts when the user presses the assigned delete key.
 */
export const entityDeletionStart =
  createAction('entity:deletion:start');

/**
 * 
 */
export const entityDeletionClick =
  createAction('entity:deletion:click', (type: EditorEntityType, id: string) => snapshotable({ payload: { type, id } }));

/**
 * The entity deletion mode stops when the user releases the assigned delete key.
 */
export const entityDeletionStop =
  createAction('entity:deletion:stop');

export default createFeature((builder) => {
  builder
    .addCase(entityDeletionStart, (state) => {
      if (state.mode !== EDITOR_MODES.NONE) return;

      // Start entity deletion mode:
      state.mode = EDITOR_MODES.ENTITY_DELETE;
    })
    .addCase(entityDeletionClick, (state, { payload: { type, id } }) => {
      if (state.mode !== EDITOR_MODES.ENTITY_DELETE) return;

      if (type === 'vertex') {
        deleteVertex(state, id);
      } else if (type === 'wall') {
        const getWallsAtVertex = selectGetWallsAtVertex(state);
        deleteWall(state, id, getWallsAtVertex);
      }
    })
    .addCase(entityDeletionStop, (state) => {
      if (state.mode !== EDITOR_MODES.ENTITY_DELETE) return;

      state.mode = EDITOR_MODES.NONE;
    });
});
