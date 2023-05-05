import { useCallback, useMemo, useRef } from "react"
import { deleteAt } from "../utils/arrays"

type HistorySubscription<T> = (undoStack: T[], redoStack: T[]) => void;

export type History<T> = {
  current: () => T;
  push: (state: T) => T;
  undo: () => T;
  redo: () => T;
  undoAll: () => T;
  subscribe: (cb: HistorySubscription<T>) => () => void;
};

const useHistory = <T>(initialEntry: T, { maxSize = 50 } = {}): History<T> => {
  const refs = useRef({
    undoStack: [initialEntry] as T[],
    redoStack: [] as T[],
    maxSize,
    subscriptions: new Map<HistorySubscription<T>, HistorySubscription<T>>(),
  });
  refs.current.maxSize = maxSize;

  const current = useCallback(() => {
    return refs.current.undoStack.at(-1)!;
  }, []);

  const push = useCallback((state: T) => {
    const {
      undoStack,
      maxSize,
      subscriptions,
    } = refs.current;

    if (undoStack.length >= maxSize)
      // Always preserve the initial state when max size is exceeded by
      // deleting second last element.
      refs.current.undoStack = deleteAt(refs.current.undoStack, 1);

    refs.current.undoStack.push(state);
    refs.current.undoStack = [...refs.current.undoStack];

    subscriptions.forEach((cb) => {
      cb(refs.current.undoStack, refs.current.redoStack);
    });

    return state;
  }, []);

  const undo = useCallback(() => {
    const {
      undoStack,
      redoStack,
      subscriptions,
    } = refs.current;

    if (undoStack.length <= 1)
      // Only contains the initial state, so nothing to undo.
      return undoStack.at(-1)!;

    redoStack.push(undoStack.pop()!);

    if (redoStack.length >= maxSize)
      redoStack.shift();

    subscriptions.forEach((cb) => {
      cb(refs.current.undoStack, refs.current.redoStack);
    });

    return undoStack.at(-1)!;
  }, []);

  const redo = useCallback(() => {
    const {
      undoStack,
      redoStack,
      subscriptions,
    } = refs.current;

    if (redoStack.length === 0)
      // Nothing to redo, return active entry.
      return undoStack.at(-1)!;
    
    undoStack.push(redoStack.pop()!);

    if (undoStack.length >= maxSize)
      refs.current.undoStack = deleteAt(undoStack, 1);

    subscriptions.forEach((cb) => {
      cb(refs.current.undoStack, refs.current.redoStack);
    });
    
    return refs.current.undoStack.at(-1)!;
  }, []);

  const undoAll = useCallback(() => {
    while (refs.current.undoStack.length !== 1)
      undo();

    refs.current.subscriptions.forEach((cb) => {
      cb(refs.current.undoStack, refs.current.redoStack);
    });
    return refs.current.undoStack.at(0)!;
  }, []);

  const subscribe = useCallback((cb: HistorySubscription<T>) => {
    refs.current.subscriptions.set(cb, cb);

    return () => {
      refs.current.subscriptions.delete(cb);
    }
  }, []);

  return useMemo(() => ({
    current,
    push,
    undo,
    redo,
    undoAll,
    subscribe,
  }), [
    current,
    push,
    undo,
    redo,
    undoAll,
    subscribe,
  ]);
};

export default useHistory;
