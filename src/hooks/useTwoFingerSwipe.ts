import { useEffect } from "react"
import throttle from 'lodash.throttle'

/**
 * Attaches an active wheel event listener to the document.
 */
const useTwoFingerSwipe = (
  /**
   * Returns a callback that is called when the user is no longer wheeling.
   */
  callback: (event: globalThis.WheelEvent) => void | (() => void),
  ms = 0
) => {
  useEffect(() => {
    let timeout: number;

    const cb = throttle((event: globalThis.WheelEvent) => {
      clearTimeout(timeout);

      const cleanup = callback(event);

      timeout = setTimeout(() => {
        cleanup?.();
      }, ms + 50);
    }, ms);

    const onWheel = (event: globalThis.WheelEvent) => {
      // The event handler itself can't be throttled because we need
      // to always call prevent default to stop the browser from navigating
      // to a different tab.
      event.preventDefault();
      event.stopImmediatePropagation();

      cb.cancel();
      cb(event);
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, [callback, ms]);
};

export default useTwoFingerSwipe;
