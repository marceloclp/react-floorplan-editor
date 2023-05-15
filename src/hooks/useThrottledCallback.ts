import { DependencyList, useCallback, useRef } from 'react';

const useThrottledCallback = <F extends (...args: any) => any>(cb: F, ms: number, deps: DependencyList = []) => {
  const refs = useRef({
    cb,
    rafId: undefined as number | undefined,
    timeStart: undefined as number | undefined,
    timeElapsed: 0,
    args: undefined as Parameters<F> | undefined,
    result: undefined as ReturnType<F> | undefined,
  });

  const nextTick = useCallback((timeStamp: number) => {
    if (refs.current.timeStart === undefined) {
      refs.current.timeStart = timeStamp;
    }

    refs.current.timeElapsed = timeStamp - refs.current.timeStart;

    // Throtted callback is ready to be invoked again:
    if (refs.current.timeElapsed >= ms) {
      // Reset the timeStart for the next iteration:
      refs.current.timeStart = undefined;

      if (refs.current.args) {
        // If there are arguments in the queue, we can invoke again:
        refs.current.result = refs.current.cb.apply(undefined, refs.current.args);
        refs.current.args = undefined;
      } else {
        // There are no arguments in the queue, so we can stop the loop:
        cancelAnimationFrame(refs.current.rafId!);
        refs.current.rafId = undefined;
        return;
      }
    }

    refs.current.rafId = requestAnimationFrame(nextTick);
  }, []);

  return useCallback((...args: Parameters<F>) => {
    refs.current.args = args;

    if (refs.current.rafId === undefined) {
      // There is no ongoing call

      // Compute the result of the leading call:
      refs.current.result = refs.current.cb.apply(undefined, refs.current.args!);
      // Reset the args so it doesn't get triggered twice inside the RAF loop:
      refs.current.args = undefined;

      // Start the RAF loop to listen for calls that happen during the delay:
      refs.current.rafId = requestAnimationFrame(nextTick);

      // Return the leading call's result:
      return refs.current.result!;
    }

    // There is already an ongoing call happening, so we must have already
    // computed the callback once. Return its value:
    return refs.current.result!;
  }, [nextTick]) as F;
};

export default useThrottledCallback;
