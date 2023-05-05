import { createAction } from '@reduxjs/toolkit'
import createFeature from '../utils/createFeature'
import { EditorState } from '../useEditorState'
import AdjacencyMatrix from '../helpers/AdjacencyMatrix'

export const vertexSelectStart =
  createAction('vertex:select:start', (index: number) => ({ payload: { index } }));

export const vertexSelectSwitch =
  createAction('vertex:select:switch', (index: number) => ({ payload: { index } }));

export const vertexSelectMove =
  createAction('vertex:select:move', (dx: number, dy: number) => ({ payload: { by: { x: dx, y: dy } } }));

export const vertexSelectDelete = createAction('vertex:select:delete');

export const vertexSelectStop = createAction('vertex:select:stop');

export default createFeature((builder) => {
  const getSelectedTargetIndex = (state: EditorState) =>
    state.vertices.findIndex(({ isSelected }) => isSelected);

  builder
    .addCase(vertexSelectStart, (state, { payload }) => {
      if (state.mode !== undefined) return;

      const { index } = payload;

      state.mode = 'selecting:vertex';
      state.vertices[index].isSelected = true;
    })
    .addCase(vertexSelectSwitch, (state, { payload }) => {
      if (state.mode !== 'selecting:vertex') return;

      const { index } = payload;

      const prevIndex = getSelectedTargetIndex(state);
      if (prevIndex >= 0 && prevIndex !== index)
        delete state.vertices[prevIndex].isSelected;

      state.vertices[index].isSelected = true;
    })
    .addCase(vertexSelectMove, (state, { payload }) => {
      if (state.mode !== 'selecting:vertex') return;

      const { by } = payload;
      const index = getSelectedTargetIndex(state);
      
      state.vertices[index].x += by.x;
      state.vertices[index].y += by.y;
    })
    .addCase(vertexSelectDelete, (state) => {
      if (state.mode !== 'selecting:vertex') return;

      const index = getSelectedTargetIndex(state);

      // Delete all walls that connect to the vertex:
      const wallsAtVertex = new AdjacencyMatrix(state)
        .wallsAtVertexIndex(index)
        .reduce((obj, index) => ({ ...obj, [index]: true }), {} as Record<number, boolean>);
      console.log(wallsAtVertex)
      state.walls = state.walls
        .filter((_, wallIndex) => !(wallIndex in wallsAtVertex));
      // console.log([...state.walls])

      state.vertices.splice(index, 1);

      // Exit selection mode as the vertex no longer exists:
      state.mode = undefined;
    })
    .addCase(vertexSelectStop, (state) => {
      if (state.mode !== 'selecting:vertex') return;

      const index = getSelectedTargetIndex(state);

      // Unselect the selected vertex:
      delete state.vertices[index].isSelected;

      // Exit selection mode:
      state.mode = undefined;
    });
});