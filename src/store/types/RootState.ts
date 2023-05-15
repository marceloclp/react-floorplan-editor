import EditorMode from './EditorMode';
import VertexEntity from './VertexEntity';
import WallEntity from './WallEntity';

type HistoryEntry = {
  vertices: Record<string, VertexEntity>;
  walls: Record<string, WallEntity>;
}

type RootState = {
  vertices: Record<string, VertexEntity>;
  walls: Record<string, WallEntity>;

  /**
   * The id of the entity that is being interacted with (e.g., dragging).
   */
  targetId?: string;

  placingWallId?: string;

  // targetSplitWallId?: string;

  mode: EditorMode;

  panning: {
    maxPanX: number;
    maxPanY: number;

    panX: number;
    panY: number;
    isDragPanning: boolean;
    isTwoFingersPanning: boolean;
  };

  zooming: {
    minZoom: number;
    maxZoom: number;
    zoom: number;
  };

  history: {
    history: HistoryEntry[],
    currentIndex: number;

    undoStack: HistoryEntry[];
    redoStack: HistoryEntry[];
    maxSize: number;
  };
};

export default RootState;