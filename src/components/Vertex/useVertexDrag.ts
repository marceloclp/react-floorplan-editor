import { useEffect, useState } from "react"
import { EditorHistory, GetVerticesAction, SetSnapAxisAction, SetVerticesAction } from "../Editor/Editor"
import { MouseSensor } from "../../hooks/useVirtualScreen"
import { replaceAt } from "../../utils/arrays"

const useVertexDrag = (
  setVertices: SetVerticesAction,
  getVertices: GetVerticesAction,
  setSnapAxis: SetSnapAxisAction,
  vs: MouseSensor<SVGGeometryElement>,
  history: EditorHistory,
) => {
  const [vertexIndex, setVertexIndex] = useState<number>();

  useEffect(() => {
    const parseIndex = (g: Element) =>
      parseInt(g.getAttribute('data-entity-index')!);
    let index: number | undefined;

    return vs.on({
      onMouseDown: () => {
        // Find closest vertex group element:
        const g = vs.closest('[data-entity-type="vertex"]');

        // Skip if the cursor is not hovering any vertex at the time of click:
        if (!g) return undefined;

        // Set the effect's internal state.
        // We only set the `vertexIndex` state if the user actually drags.
        index = parseIndex(g);
      },
      onMouseDragMove: () => {
        // If no vertex is selected, skip this event.
        if (index === undefined) return undefined;

        // Update the `vertexIndex` state to update the UI
        setVertexIndex(index);
        setSnapAxis(vs.snapAxis);

        setVertices((vertices) => {
          return replaceAt(vertices, index!, vs.snapToGrid(vs.dragPoint));
        });
      },
      onMouseUp: () => {
        // Skip if no vertex is being dragged:
        if (index === undefined) return undefined;

        // Push current state to history:
        history.push(getVertices());

        index = undefined;
        setVertexIndex(undefined);
      },
    });
  }, [vs, history]);
  
  return { vertexIndex };
};

export default useVertexDrag;
