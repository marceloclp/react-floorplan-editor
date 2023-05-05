import { useEffect, useState } from "react";
import {
  EditorHistory,
  GetVerticesAction,
  SetSnapAxisAction,
  SetVerticesAction,
} from "../Editor/Editor";
import findColinearPoint from "../../utils/findColinearPoint";
import { flushSync } from "react-dom";
import { insertAt } from "../../utils/arrays";
import Point from "../../types/Point";
import { MouseSensor } from "../../hooks/useVirtualScreen"
import useRefState from "../../hooks/useRefState"

export const useWallSplit = (
  setVertices: SetVerticesAction,
  getVertices: GetVerticesAction,
  setSnapAxis: SetSnapAxisAction,
  vs: MouseSensor<SVGGraphicsElement>,
  history: EditorHistory
) => {
  const [wallIndex, setWallIndex] = useState<number>();
  const [splitVertex, setSplitVertex] = useState<Point>();

  const refs = useRefState({ wallIndex });

  useEffect(() => {
    const parseIndex = (g: Element) =>
      parseInt(g.getAttribute('data-entity-index')!);

    const resetInternalState = () => {
      setWallIndex(undefined);
      setSplitVertex(undefined);
      setSnapAxis(undefined);
    };

    const setSplitVertexOnLine = (index: number, point: Point) => {
      setWallIndex(index);

      const vertices = getVertices();

      const A = vertices[index!];
      const B = vertices[(index! + 1) % vertices.length];

      setSplitVertex(findColinearPoint(A, B, point));
    };

    const addSplitVertexToVertices = () => {
      flushSync(() => {
        setSplitVertex((vertex) => {
          if (!vertex) return vertex;
          setVertices((vertices) => {
            if (refs.current.wallIndex === undefined)
              return vertices;
            return insertAt(vertices, refs.current.wallIndex + 1, vertex);
          });
          return undefined;
        });
      });
      if (refs.current.wallIndex !== undefined)
        setWallIndex(refs.current.wallIndex + 1);
      history.push(getVertices());
    };

    return vs.on({
      onMouseMove: () => {
        // If the user is no longer holding the meta key, he has left the
        // wall splitting mode, so reset the internal state:
        if (!vs.keyMeta) return resetInternalState();

        // Find closest wall's group element
        const g = vs.closest('[data-entity-type="wall"]');

        // If the cursor goes over a wall, update the selected wall index and
        // place the split vertex colinear to the wall its hovering:
        if (g) setSplitVertexOnLine(parseIndex(g), vs.point);

        // Otherwise place the split vertex on the grid:
        else setSplitVertex(vs.snapToGrid(vs.point));
      },
      onMouseDown: () => {
        if (!vs.keyMeta && refs.current.wallIndex !== undefined)
          return resetInternalState();
        addSplitVertexToVertices();
      },
    });
  }, [vs]);

  const vertices = getVertices();
  const isWallSplitting = wallIndex !== undefined;

  return {
    isWallSplitting,
    wallIndex,
    splitVertex,
    prevSplitVertex: isWallSplitting ? vertices[wallIndex] : undefined,
    nextSplitVertex: isWallSplitting ? vertices[(wallIndex + 1) % vertices.length] : undefined,
  };
};

export default useWallSplit;
