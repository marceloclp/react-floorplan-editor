import { useCallback, useEffect, useState } from "react"
import useRefState from "../../hooks/useRefState"
import { EditorHistory, GetVerticesAction, SetVerticesAction } from "../Editor/Editor"
import { deleteAt, replaceAt } from "../../utils/arrays"
import { MouseSensor } from "../../hooks/useVirtualScreen"
import Point from "../../types/Point"

const useVertexSelect = (
  setVertices: SetVerticesAction,
  getVertices: GetVerticesAction,
  vs: MouseSensor<SVGGeometryElement>,
  history: EditorHistory
) => {
  const [vertexIndex, setVertexIndex] = useState<number>();
  const refs = useRefState({ index: vertexIndex });

  const onVertexDelete = useCallback(() => {
    // There is no vertex selected
    if (refs.current.index === undefined) return;

    const h = history.push(
      deleteAt(history.current(), refs.current.index)
    );

    setVertices(h);
    setVertexIndex(undefined);
  }, [history]);

  useEffect(() => {
    const parseIndex = (g: Element) =>
      parseInt(g.getAttribute('data-entity-index')!);
    let index: number | undefined;

    return vs.on({
      onMouseDown: () => {
        // Find closest vertex group element.
        const g = vs.closest('[data-entity-type="vertex"]');

        index = g ? parseIndex(g) : undefined;
        setVertexIndex(index);
      },
      onKeyDown: (event) => {
        if (index === undefined) return;

        event.stopPropagation();
        event.preventDefault();

        const setVertexUnidir = (dx: number, dy: number) => {
          const updateVertex = ({ x, y }: Point) =>
            vs.snapToGrid({ x: x + dx, y: y + dy });
          setVertices((vertices) =>
            replaceAt(vertices, index!, updateVertex)
          );
        }
        
        const setNextVertexIndex = (di: number) => {
          index = (getVertices().length + index! + di) % getVertices().length;
          setVertexIndex(index);
        };

        if (vs.kb.isShortcut(['ArrowUp'], 'all'))
          setVertexUnidir(0, -20);
        else if (vs.kb.isShortcut(['ArrowDown'], 'all'))
          setVertexUnidir(0, 20);
        else if (vs.kb.isShortcut(['ArrowLeft'], 'all'))
          setVertexUnidir(-20, 0);
        else if (vs.kb.isShortcut(['ArrowRight'], 'all'))
          setVertexUnidir(20, 0);
        else if (vs.kb.isShortcut(['ShiftLeft', 'Tab'], ['Tab']))
          setNextVertexIndex(1);
        else if (vs.kb.isShortcut(['Tab'], 'all'))
          setNextVertexIndex(-1);
        else if (vs.kb.isShortcut(['Backspace'], 'all')) {
          onVertexDelete();
          index = undefined;
        }
      },
    })
  }, [vs, setVertices, getVertices]);

  return { vertexIndex, onVertexDelete };
};

export default useVertexSelect;
