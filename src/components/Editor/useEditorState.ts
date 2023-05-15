import { useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";
import { MouseSensor } from "../../hooks/useVirtualScreen";
import EditorMode from "../../store/types/EditorMode";
import useRefState from "../../hooks/useRefState";
import useEditorMode from "../../store/hooks/useEditorMode";
import { EDITOR_MODES } from "../../store/constants";
import { panStart, panStop, panUpdate } from "../../store/features/Panning";
import {
  vertexSelectDelete,
  vertexSelectMove,
  vertexSelectStart,
  vertexSelectStop,
  vertexSelectSwitch,
} from "../../store/features/VertexSelecting";
import {
  wallSelectDelete,
  wallSelectMove,
  wallSelectStart,
  wallSelectStop,
  wallSelectSwitch,
} from "../../store/features/WallSelecting";
import { vertexPlaceStart } from "../../store/features/VertexPlacing";
import { vertexPlaceUpdate } from "../../store/features/VertexPlacing";
import { vertexPlaceClick } from "../../store/features/VertexPlacing";
import { vertexPlaceStop } from "../../store/features/VertexPlacing";
import {
  wallPlaceClick,
  wallPlaceStop,
  wallPlaceUpdate,
} from "../../store/features/WallPlacing";
import {
  wallSplitClick,
  wallSplitStart,
  wallSplitStop,
  wallSplitUpdateOnGrid,
  wallSplitUpdateOnWall,
} from "../../store/features/WallSplitting";
import {
  vertexDragDrop,
  vertexDragStart,
  vertexDragUpdate,
} from "../../store/features/VertexDragging";
import { wallDragDrop, wallDragStart, wallDragUpdate } from "../../store/features/WallDragging"
import useTwoFingerSwipe from "../../hooks/useTwoFingerSwipe"
import { entityDeletionClick, entityDeletionStart, entityDeletionStop } from "../../store/features/EntityDeletion"

export type EditorEntityType = "wall" | "vertex" | "grid";

const useEditorState = (vs: MouseSensor<SVGGeometryElement>) => {
  const act = useDispatch();

  const refs = useRefState({
    mode: useEditorMode(),
  });

  const isMode = useCallback((mode: EditorMode) => {
    return mode === refs.current.mode;
  }, [refs])

  useEffect(() => {
    const isSelectionMode = () =>
      isMode(EDITOR_MODES.SELECTING_VERTEX) ||
      isMode(EDITOR_MODES.SELECTING_WALL);
    const isPlacingMode = () =>
      isMode(EDITOR_MODES.PLACING_VERTEX) ||
      isMode(EDITOR_MODES.PLACING_WALL) ||
      isMode(EDITOR_MODES.SPLITTING_WALL);
    const isDraggingMode = () =>
      isMode(EDITOR_MODES.DRAGGING_VERTEX) ||
      isMode(EDITOR_MODES.DRAGGING_WALL);

    const isHoldingPanKey = () => vs.kb.isDown(["Space"]);
    const isHoldingDragKey = () => vs.keyMeta;
    const isHoldingPlaceKey = () => vs.keyAlt;
    const isHoldingDeleteKey = () => vs.kb.isDown(['KeyD']);

    const getGElement = () => {
      const g = vs.closest("[data-entity-type]");
      const gType = g?.getAttribute("data-entity-type") as EditorEntityType;
      const gId = g?.getAttribute("data-entity-id")!;
      return { g, gType, gId };
    };

    const handlePanDragStart = () => {
      // Skip if the user is performing an action:
      if (!isMode(EDITOR_MODES.NONE)) return;

      // Skip if user is not holding the panning key:
      if (!isHoldingPanKey()) return;

      // Start drag panning:
      act(panStart(true));
    };

    const handlePanDragUpdate = (dx: number, dy: number) => {
      // Skip if the user is not in panning mode:
      if (!isMode(EDITOR_MODES.PANNING)) return;

      // Stop if user has released the panning key:
      if (!isHoldingPanKey()) return act(panStop());

      act(panUpdate(dx, dy));
    };

    const handlePanDragStop = () => {
      // Skip if the user is not in panning mode:
      if (!isMode(EDITOR_MODES.PANNING)) return;

      act(panStop());
    };

    /**
     * - Runs on mouse down (instead of on click / mouse up, as this would
     *   interfere with dragging).
     * - Mouse left button.
     * - User must not be holding the dragging/placing modifier keys.
     * - No edit mode can be active.
     * - User must click on a valid selectable entity to start.
     */
    const handleSelectStart = () => {
      // Skip if user is attempting another action like dragging/placing:
      if (isHoldingDragKey() || isHoldingPlaceKey() || isHoldingPanKey())
        return;

      // Skip if another mode is active:
      if (!isMode(EDITOR_MODES.NONE)) return;

      // Skip if the button pressed was not MLB:
      if (!vs.clickLeft) return;

      const { g, gType, gId } = getGElement();
      // Skip if no valid selectable entity is found:
      if (!g) return;

      switch (gType) {
        case "vertex":
          return act(vertexSelectStart(gId));
        case "wall":
          return act(wallSelectStart(gId));
      }
    };

    /**
     * - Runs on mouse down (instead of on click / mouse up, as this would
     *   interfere with dragging).
     * - Mouse left button.
     * - User must be in selection mode.
     * - User must click on a dimissable entity (grid) to stop.
     * - User must click on a selectable entity to switch.
     */
    const handleSelectStopOrSwitch = () => {
      // Skip if no selection mode is active
      if (!isSelectionMode()) return;

      if (!vs.clickLeft) return;

      const { g, gType, gId } = getGElement();

      // Skip if the user presses outside of the SVG area:
      if (!g) return;

      switch (gType) {
        case "grid":
          // Stop selection if user presses outside a selectable element:
          switch (refs.current.mode) {
            case EDITOR_MODES.SELECTING_VERTEX:
              return act(vertexSelectStop());
            case EDITOR_MODES.SELECTING_WALL:
              return act(wallSelectStop());
          }
          return;
        case "vertex":
          return act(vertexSelectSwitch(gId));
        case "wall":
          return act(wallSelectSwitch(gId));
      }
    };

    /**
     * - Runs on key down.
     * - User must be in selection mode.
     */
    const handleSelectKeyboardControls = (keyCode: string) => {
      // Skip if no selection mode is active
      if (!isSelectionMode()) return;

      switch (refs.current.mode) {
        case EDITOR_MODES.SELECTING_VERTEX:
          switch (keyCode) {
            case "ArrowUp":
              return act(vertexSelectMove(0, -20));
            case "ArrowDown":
              return act(vertexSelectMove(0, 20));
            case "ArrowRight":
              return act(vertexSelectMove(20, 0));
            case "ArrowLeft":
              return act(vertexSelectMove(-20, 0));
            case "Backspace":
              return act(vertexSelectDelete());
            case "Escape":
              return act(vertexSelectStop());
          }
          return;
        case EDITOR_MODES.SELECTING_WALL:
          switch (keyCode) {
            case "ArrowUp":
              return act(wallSelectMove(0, -20));
            case "ArrowDown":
              return act(wallSelectMove(0, 20));
            case "ArrowRight":
              return act(wallSelectMove(20, 0));
            case "ArrowLeft":
              return act(wallSelectMove(-20, 0));
            case "Backspace":
              return act(wallSelectDelete());
            case "Escape":
              return act(wallSelectStop());
          }
          return;
      }
    };

    /**
     * - Runs on mouse move (as it depends on a modifier key hold)
     * - User must be holding the Placing Key (Alt) to start
     * - Placing mode always starts with vertex placing mode:
     *    - Switch to split-vertex placing mode if the user hovers a wall
     *    - Switch to wall placing mode if the user places a point
     */
    const handlePlaceStart = () => {
      // User must be holding the Placing Key (Alt) to start
      if (!isHoldingPlaceKey()) return;

      // User must not be in any mode to start:
      if (!isMode(EDITOR_MODES.NONE)) return;

      const point = vs.snapToGrid(vs.point);
      act(vertexPlaceStart(point));
    };

    /**
     * - Runs on mouse move
     * - User must be holding the Placing Key (Alt) at all times
     * - Vertex placing mode must already be active:
     */
    const handlePlaceUpdate = () => {
      // User must be holding the Placing Key (Alt) at all times
      if (!isHoldingPlaceKey()) return;

      // User must already be in a placing mode:
      if (!isPlacingMode()) return;

      const { g, gType, gId } = getGElement();
      const isHoveringWall = !!g && gType === "wall";
      const point = vs.snapToGrid(vs.point);

      switch (refs.current.mode) {
        case EDITOR_MODES.PLACING_VERTEX:
          return isHoveringWall
            ? act(wallSplitStart(gId, point))
            : act(vertexPlaceUpdate(point));
        case EDITOR_MODES.PLACING_WALL:
          return act(wallPlaceUpdate(point));
        case EDITOR_MODES.SPLITTING_WALL:
          return isHoveringWall
            ? act(wallSplitUpdateOnWall(gId, point))
            : act(wallSplitUpdateOnGrid(point));
      }
    };

    /**
     * - Runs on mouse left click
     * - User must be holding the Placing Key (Alt) during click
     * - A placing mode must already be active
     */
    const handlePlaceClick = () => {
      // User must be holding the Placing Key (Alt) during click
      if (!isHoldingPlaceKey()) return;

      // User must be in a placing mode:
      if (!isPlacingMode()) return;

      if (!vs.clickLeft) return;

      switch (refs.current.mode) {
        case EDITOR_MODES.PLACING_VERTEX:
          return act(vertexPlaceClick());
        case EDITOR_MODES.PLACING_WALL:
          return act(wallPlaceClick());
        case EDITOR_MODES.SPLITTING_WALL:
          return act(wallSplitClick());
      }
    };

    /**
     * - Runs on mouse move (as it depends on a modifier key hold)
     * - A placing mode must be ongoing
     * - Triggered if the user ever releases the modifier key
     */
    const handlePlaceStop = () => {
      // Skip if user is still holding the placing key:
      if (isHoldingPlaceKey()) return;

      // Skip if the user is not in placing mode:
      if (!isPlacingMode()) return;

      switch (refs.current.mode) {
        case EDITOR_MODES.PLACING_VERTEX:
          return act(vertexPlaceStop());
        case EDITOR_MODES.PLACING_WALL:
          return act(wallPlaceStop());
        case EDITOR_MODES.SPLITTING_WALL:
          return act(wallSplitStop());
      }
    };

    /**
     * - Runs on mouse drag start
     * - User must be holding the Dragging Key (Meta) to start
     * - No edit mode can be active
     * - User must click on a valid draggable entity to start
     */
    const handleDragStart = () => {
      // Skip if user is not holding drag key:
      if (!isHoldingDragKey()) return;

      // Skip if there is an active edit mode:
      if (!isMode(EDITOR_MODES.NONE)) return;

      const { g, gType, gId } = getGElement();

      // If g is not a valid element, then there is nothing to start dragging:
      if (!g) return;

      switch (gType) {
        case 'vertex': return act(vertexDragStart(gId));
        case 'wall':   return act(wallDragStart(gId));
      }
    };

    /**
     * - Runs on mouse drag move
     * - The user can release the dragging key once drag has started
     * - A dragging mode must be going on
     */
    const handleDragUpdate = () => {
      // Skip if no dragging mode is happening:
      if (!isDraggingMode()) return;

      const by = vs.snapToGrid({ x: vs.deltaX, y: vs.deltaY });

      switch (refs.current.mode) {
        case EDITOR_MODES.DRAGGING_VERTEX:
          return act(vertexDragUpdate(by));
        case EDITOR_MODES.DRAGGING_WALL:
          return act(wallDragUpdate(by));
      }
    };

    /**
     * - Runs on mouse drag stop
     * - The user can release the dragging key once drag has started
     * - A dragging mode must be going on
     */
    const handleDragStop = () => {
      // Skip if no dragging mode is happening:
      if (!isDraggingMode()) return;

      switch (refs.current.mode) {
        case EDITOR_MODES.DRAGGING_VERTEX:
          return act(vertexDragDrop());
        case EDITOR_MODES.DRAGGING_WALL:
          return act(wallDragDrop());
      }
    };

    const handleEntityDeleteStop = () => {
      if (!isMode(EDITOR_MODES.ENTITY_DELETE)) return;

      if (isHoldingDeleteKey()) return;

      vs.kb.flush(['KeyD']);

      return act(entityDeletionStop());
    };

    const handleEntityDeleteClick = () => {
      if (!isMode(EDITOR_MODES.ENTITY_DELETE)) return;

      if (!isHoldingDeleteKey()) return handleEntityDeleteStop();

      const { g, gType, gId } = getGElement();
      
      if (!g || !gType || !['wall', 'vertex'].includes(gType)) return;

      return act(entityDeletionClick(gType, gId));
    };

    return vs.on({
      onMouseDown: () => {
        if (isMode(EDITOR_MODES.NONE))
          if (
            !isHoldingDragKey() &&
            !isHoldingPlaceKey() &&
            !isHoldingDragKey()
          )
            if (vs.clickLeft)
              return handleSelectStart();
        if (isSelectionMode())
          if (vs.clickLeft)
            return handleSelectStopOrSwitch();
        if (isHoldingPlaceKey())
          if (isPlacingMode())
            if (vs.clickLeft)
              return handlePlaceClick();
        if (isMode(EDITOR_MODES.ENTITY_DELETE))
            if (isHoldingDeleteKey())
              return handleEntityDeleteClick();
      },
      onMouseMove: () => {
        if (isHoldingPlaceKey())
          if (isMode(EDITOR_MODES.NONE)) handlePlaceStart();
        if (isHoldingPlaceKey()) if (isPlacingMode()) handlePlaceUpdate();
        if (!isHoldingPlaceKey()) if (isPlacingMode()) return handlePlaceStop();
      },
      onMouseDragStart: () => {
        if (isMode(EDITOR_MODES.NONE))
          if (isHoldingPanKey()) return handlePanDragStart();
        if (isMode(EDITOR_MODES.NONE))
          if (isHoldingDragKey()) return handleDragStart();
      },
      onMouseDragMove: ({ movementX: dx, movementY: dy }) => {
        if (isMode(EDITOR_MODES.PANNING)) return handlePanDragUpdate(dx, dy);
        if (isDraggingMode()) return handleDragUpdate();
      },
      onMouseDragStop: () => {
        if (isMode(EDITOR_MODES.PANNING))
          if (!isHoldingPanKey()) return handlePanDragStop();
        if (isDraggingMode()) return handleDragStop();
      },
      onKeyDown: ({ key: keyCode }) => {
        if (isMode(EDITOR_MODES.NONE))
          if (isHoldingPanKey())
            return handlePanDragStart();
        if (isSelectionMode())
          return handleSelectKeyboardControls(keyCode);
        // if (isMode(EDITOR_MODES.NONE))
        //   if (isHoldingDeleteKey())
        //     return handleEntityDeleteStart();
      },
      onKeyUp: () => {
        if (isMode(EDITOR_MODES.PANNING))
          if (!isHoldingPanKey())
            return handlePanDragStop();
        // if (isMode(EDITOR_MODES.ENTITY_DELETE))
        //   if (!isHoldingDeleteKey())
        //     return handleEntityDeleteStop();
      },
    });
  }, [act, vs, refs, isMode]);

  useEffect(() => {
    const isHoldingDeleteKey = () => vs.kb.isDown(['KeyD']);

    const handleEntityDeleteStart = () => {
      if (!isMode(EDITOR_MODES.NONE)) return;

      if (!isHoldingDeleteKey()) return;

      return act(entityDeletionStart());
    };

    const handleEntityDeleteStop = () => {
      if (!isMode(EDITOR_MODES.ENTITY_DELETE)) return;

      if (isHoldingDeleteKey()) return;

      vs.kb.flush(['KeyD']);

      return act(entityDeletionStop());
    };

    const onKeyDown = () => {
      if (isMode(EDITOR_MODES.NONE))
        if (isHoldingDeleteKey())
          return handleEntityDeleteStart();
    };

    const onKeyUp = () => {
      if (isMode(EDITOR_MODES.ENTITY_DELETE))
        if (!isHoldingDeleteKey())
          return handleEntityDeleteStop();
    };

    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [act, isMode, vs]);

  useTwoFingerSwipe(
    useCallback(({ deltaX, deltaY }) => {
      if (isMode(EDITOR_MODES.NONE))
        act(panStart(false));
        
      act(panUpdate(-deltaX, -deltaY));

      return () => act(panStop());
    }, [act, isMode]),
    25
  );
};

export default useEditorState;
