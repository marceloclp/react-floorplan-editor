import { useCallback, useEffect, useState } from "react"
import useRefState from "./useRefState"
import useTwoFingerSwipe from "./useTwoFingerSwipe"
import { MouseSensor } from "./useVirtualScreen"

const clamp = (value: number, max: number, min: number) =>
  Math.max(min, Math.min(max, value));

const usePanning = (vs: MouseSensor<SVGGeometryElement>, { maxPanX = Infinity, maxPanY = Infinity }) => {
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const [isDragPanning, setIsDragPanning] = useState(false);
  const [isTwoFingersPanning, setIsTwoFingersPanning] = useState(false);

  const refs = useRefState({ maxPanX, maxPanY });

  useEffect(() => {
    const isGridElement = (element: Element) =>
      element.getAttribute('data-entity-type') === 'grid';

    return vs.on({
      onMouseDrag: (event) => {
        if (!vs.kb.isShortcut(['Space']) || !isGridElement(vs.target()))
          return;

        event.stopPropagation();
        setIsDragPanning(true);

        const { maxPanX, maxPanY } = refs.current;
        setPanX((currPanX) => {
          return clamp(currPanX + event.movementX, maxPanX, -maxPanX);
        });
        setPanY((currPanY) => {
          return clamp(currPanY + event.movementY, maxPanY, -maxPanY);
        });
      },
      onMouseUp: () => {
        setIsDragPanning(false);
      },
    });
  }, [vs]);

  useTwoFingerSwipe(
    useCallback(({ deltaX, deltaY }) => {
      setIsTwoFingersPanning(true);

      const { maxPanX, maxPanY } = refs.current;
        setPanX((currPanX) => {
          return clamp(currPanX - deltaX, maxPanX, -maxPanX);
        });
        setPanY((currPanY) => {
          return clamp(currPanY - deltaY, maxPanY, -maxPanY);
        });

      return () => setIsTwoFingersPanning(false);
    }, []),
    25
  );

  return { panX, panY, isDragPanning, isTwoFingersPanning };
};

export default usePanning;