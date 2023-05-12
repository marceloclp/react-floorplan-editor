export const EDITOR_MODES = {
  NONE: 'none',
  SELECTING_VERTEX: 'selecting:vertex',
  SELECTING_WALL: 'selecting:wall',
  PLACING_VERTEX: 'placing:vertex',
  PLACING_WALL: 'placing:wall',
  DRAGGING_VERTEX: 'dragging:vertex',
  DRAGGING_WALL: 'dragging:wall',
  SPLITTING_WALL: 'splitting:wall',

  PANNING: 'panning',

  ENTITY_DELETE: 'entity:delete',
} as const;
