import { useEffect, useReducer } from "react"
import Point from "../../types/Point"
import { ActionReducerMapBuilder, bindActionCreators, createReducer } from '@reduxjs/toolkit';
import vertexDraggingReducer, { vertexDragDrop, vertexDragStart, vertexDragUpdate } from "./features/VertexDragging"
import wallDraggingReducer, { wallDragDrop, wallDragStart, wallDragUpdate } from "./features/WallDragging"
import { MouseSensor } from "../../hooks/useVirtualScreen"
import useRefState from "../../hooks/useRefState"
import vertexPlacingReducer, { vertexPlaceClick, vertexPlaceStart, vertexPlaceStop, vertexPlaceUpdate } from "./features/VertexPlacing"
import wallPlacingReducer, { wallPlaceClick, wallPlaceStop, wallPlaceUpdate } from "./features/WallPlacing"
import wallSplittingReducer, { wallSplitClick, wallSplitStart, wallSplitStop, wallSplitUpdateOnGrid, wallSplitUpdateOnWall } from './features/WallSplitting';
import vertexSelectingReducer, { vertexSelectDelete, vertexSelectMove, vertexSelectStart, vertexSelectStop } from './features/VertexSelecting';
import createSwitchAct from "./utils/createSwitchAct"

type EditorMode =
  | 'placing:vertex'
  | 'placing:wall'
  | 'moving:vertex'
  | 'moving:wall'
  | 'placing:split_vertex'
  | 'dragging:vertex'
  | 'dragging:wall'
  | 'selecting:vertex';

export type EditorEntityType = 'wall' | 'vertex' | 'grid';

type Vertex = Point & {
  isSelected?: boolean;
  /** A placing vertex is a temporary entity. */
  isPlacing?: boolean;
  isMoving?: boolean;
  isSplitting?: boolean;
  isDragging?: boolean;
};
type Wall = {
  v1: number;
  v2: number;
  /** A placing wall is a temporary entity. */
  isPlacing?: boolean;
  isMoving?: boolean;
  isSplitting?: boolean;
  isSplitTarget?: boolean;
};

type EditorTarget = {
  type: 'wall' | 'vertex';
  index: number;
}

export type EditorState = {
  vertices: Vertex[];
  walls: Wall[];
  snapAxis?: 'x' | 'y';
  /**
   * Used to update the UI to display the ongoing user interaction.
   */
  mode?: EditorMode;
};

export type EditorRefs = {
  target?: EditorTarget;
};

export type ReducerBuilder = (builder: ActionReducerMapBuilder<EditorState>, refs: EditorRefs) => void;

const initialState: EditorState = { vertices: [], walls: [] };

export const createTarget = (type: 'vertex' | 'wall', index: number): EditorTarget => ({ type, index });

const editorReducer = createReducer(initialState, (builder) => {
  const refs: EditorRefs = {};

  vertexDraggingReducer(builder, refs);
  wallDraggingReducer(builder, refs);
  vertexPlacingReducer(builder, refs);
  wallPlacingReducer(builder, refs);

  wallSplittingReducer(builder, refs);

  vertexSelectingReducer(builder, refs);
});

const useEditorState = (v: Point[], vs: MouseSensor<SVGGeometryElement>) => {
  const [state, act] = useReducer(editorReducer, {
    ...initialState,
    vertices: v,
    walls: [{ v1: 0, v2: 1 }, { v1: 0, v2: 2 }, { v1: 1, v2: 2}, { v1: 2, v2: 3}, {v1: 1, v2: 3}],
  });

  const refs = useRefState({
    mode: state.mode,
  });

  useEffect(() => {
    const isMode = (mode: EditorMode) => refs.current.mode === mode;
    const isHoldingPlacingKey = () => vs.keyAlt;
    const isHoldingDraggingKey = () => vs.keyMeta;

    const switchAct = createSwitchAct(act);

    return vs.on({
      onMouseClick: () => {
        const g = vs.closest('[data-entity-type]');
        if (!g) return;

        const gType = g.getAttribute('data-entity-type') as EditorEntityType;
        const gIndex = parseInt(g.getAttribute('data-entity-index')!);

        switch (gType) {
          case 'vertex': return act(vertexSelectStart(gIndex));
        }
      },
      onMouseDown: () => {
        if (isHoldingPlacingKey()) {
          switch (refs.current.mode) {
            case 'placing:vertex':       return act(vertexPlaceClick());
            case 'placing:wall':         return act(wallPlaceClick());
            case 'placing:split_vertex': return act(wallSplitClick());
          }
        }
      },
      onMouseMove: () => {
        if (!isHoldingPlacingKey())
          return switchAct(refs.current.mode!, {
            'placing:vertex':       () => vertexPlaceStop(),
            'placing:wall':         () => wallPlaceStop(),
            'placing:split_vertex': () => wallSplitStop(),
          });

        const point = vs.snapToGrid(vs.point);
        const g = vs.closest('[data-entity-type]');
        const gType = g?.getAttribute('data-entity-type') as EditorEntityType;
        const gIndex = parseInt(g?.getAttribute('data-entity-index')!);

        const isWall = gType === 'wall';

        if (!refs.current.mode)
          return act(vertexPlaceStart(point));

        return switchAct(refs.current.mode, {
          'placing:wall':
            () => wallPlaceUpdate(point),
          'placing:vertex': isWall
            ? () => wallSplitStart(gIndex, point)
            : () => vertexPlaceUpdate(point),
          'placing:split_vertex': isWall
            ? () => wallSplitUpdateOnWall(gIndex, point)
            : () => wallSplitUpdateOnGrid(point),
        });
      },
      onMouseDragStart: () => {
        // The user must be holding the drag key to initiate dragging modes:
        if (!isHoldingDraggingKey()) return;

        // Check if the cursor is hovering over a draggable element:
        const g = vs.closest('[data-entity-type]');
        // If there is no valid g element, skip:
        if (!g) return;

        const gType = g.getAttribute('data-entity-type')! as EditorEntityType;
        const gIndex = parseInt(g.getAttribute('data-entity-index')!);

        return switchAct(gType, {
          vertex: () => vertexDragStart(gIndex),
          wall:   () => wallDragStart(gIndex),
        });
      },
      onMouseDrag: () => {
        const by: Point = vs.snapToGrid({ x: vs.deltaX, y: vs.deltaY });

        return switchAct(refs.current.mode!, {
          'dragging:vertex': () => vertexDragUpdate(by),
          'dragging:wall':   () => wallDragUpdate(by),
        });
      },
      onMouseDragStop: () => {
        return switchAct(refs.current.mode!, {
          'dragging:vertex': () => vertexDragDrop(),
          'dragging:wall':   () => wallDragDrop(),
        });
      },
      onKeyDown: ({ code: keyCode }) => {
        if (isMode('selecting:vertex'))
          return switchAct(keyCode, {
            ArrowUp:    () => vertexSelectMove(0, -20),
            ArrowDown:  () => vertexSelectMove(0, 20),
            ArrowRight: () => vertexSelectMove(20, 0),
            ArrowLeft:  () => vertexSelectMove(-20, 0),
            Escape:     () => vertexSelectStop(),
            Backspace:  () => vertexSelectDelete(),
          });
      },
    })
  }, [vs]);

  return { ...state, dispatch: act };
}

export default useEditorState;