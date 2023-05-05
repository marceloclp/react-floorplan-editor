import { Dispatch, useCallback, useState } from "react"
import useRefState from "./useRefState"

type SetZoomReducer = (zoom: number, step: number) => number;
type SetZoomAction = number | SetZoomReducer;
export type HandleZoom = Dispatch<SetZoomAction>;

const useZooming = ({ step = 0.1, minZoom = 0.1, maxZoom = Infinity } = {}) => {
  const [zoom, setZoom] = useState(1);

  const refs = useRefState({
    step,
    maxZoom,
    minZoom,
  });

  const handleZoom: HandleZoom = useCallback((reducer: SetZoomAction) => {
    const {
      step,
      maxZoom,
      minZoom,
    } = refs.current;
    setZoom((currZoom) => {
      const nextZoom = typeof reducer === 'function'
        ? reducer(currZoom, step)
        : reducer;
      return Math.max(minZoom, Math.min(maxZoom, nextZoom));
    });
  }, []);

  return {
    zoom,
    handleZoom,
  };
};

export default useZooming;
