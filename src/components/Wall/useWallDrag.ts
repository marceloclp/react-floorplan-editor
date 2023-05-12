import { useEffect, useState } from "react"
import { EditorHistory, GetVerticesAction, SetSnapAxisAction, SetVerticesAction } from "../Editor/Editor"
import Point from "../../types/Point"
import { MouseSensor } from "../../hooks/useVirtualScreen"
import useRefState from "../../hooks/useRefState"
import { replaceAt } from "../../utils/arrays"

const useWallDrag = (
  setVertices: SetVerticesAction,
  getVertices: GetVerticesAction,
  setSnapAxis: SetSnapAxisAction,
  vs: MouseSensor<SVGGeometryElement>,
  history: EditorHistory,
) => {
  const [wallIndex, setWallIndex] = useState<number>();
  const [isDragging, setIsDragging] = useState(false);

  const refs = useRefState({ wallIndex });

  useEffect(() => {
    const parseIndex = (g: Element) =>
      parseInt(g.getAttribute('data-entity-index')!);

    let vertexA: Point | undefined;
    let vertexB: Point | undefined;

    const updateWallIndex = (index?: number) => {
      if (index === undefined) {
        vertexA = undefined;
        vertexB = undefined;
        setWallIndex(undefined);
      } else {
        const vertices = getVertices();
        const i = (vertices.length + index) % vertices.length;
        const j = (vertices.length + index + 1) % vertices.length;
        vertexA = vertices[i];
        vertexB = vertices[j];
        setWallIndex(i);
      }
    };

    const updateWall = (dx: number, dy: number) =>
      setVertices((vertices) => {
        if (refs.current.wallIndex === undefined) return vertices;

        const i = refs.current.wallIndex!;
        const j = (i + 1) % vertices.length;

        const updateVertex = ({ x, y }: Point) => () =>
          vs.snapToGrid({ x: x + dx, y: y + dy });

        const v1 = replaceAt(vertices, i, updateVertex(vertexA!));
        return replaceAt(v1, j, updateVertex(vertexB!));
      });

    return vs.on({
      onMouseDown: () => {
        const g = vs.closest('[data-entity-type="wall"]');

        if (!g) return updateWallIndex(undefined);

        updateWallIndex(parseIndex(g));
      },
      onMouseDragMove: () => {
        // Skip if no wall is selected
        if (refs.current.wallIndex === undefined) return;

        setSnapAxis(vs.snapAxis);
        setIsDragging(true);
        updateWall(vs.dragX - vs.initialDragX, vs.dragY - vs.initialDragY);
      },
      onMouseUp: () => {
        if (refs.current.wallIndex === undefined) return;

        setSnapAxis(undefined);
        setIsDragging(false);
        
        history.push(getVertices());
      },
      onKeyDown: (event) => {
        if (refs.current.wallIndex === undefined) return;
        if (vs.hasDragged && vs.clickLeft) return;
        if (vs.kb.isDown(['MetaLeft', 'KeyR'])) return;

        event.preventDefault();
        event.stopPropagation();

        updateWallIndex(refs.current.wallIndex);

        if (vs.kb.isShortcut(['ArrowUp'], 'all'))
          updateWall(0, -20);
        else if (vs.kb.isShortcut(['ArrowDown'], 'all'))
          updateWall(0, 20);
        else if (vs.kb.isShortcut(['ArrowLeft'], 'all'))
          updateWall(-20, 0);
        else if (vs.kb.isShortcut(['ArrowRight'], 'all'))
          updateWall(20, 0);
        else if (vs.kb.isShortcut(['ShiftLeft', 'Tab'], ['Tab']))
          updateWallIndex(refs.current.wallIndex - 1);
        else if (vs.kb.isShortcut(['Tab'], 'all'))
          updateWallIndex(refs.current.wallIndex + 1);
        else if (vs.kb.isShortcut(['Escape'], 'all'))
          updateWallIndex(undefined);
      },
    });
  }, [vs, history, getVertices, setVertices, setSnapAxis]);

  return {
    wallIndex,
    draggingWallIndex: isDragging ? wallIndex : undefined,
    selectedWallIndex: wallIndex,
    isSelected: wallIndex !== undefined,
    isDragging,
  };
};

export default useWallDrag;
