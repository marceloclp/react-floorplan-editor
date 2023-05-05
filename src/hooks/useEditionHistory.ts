import { SetStateAction, useRef } from "react"

type Reducer<T> = (prevState: T) => T;
type ActionType = 'push' | 'undo' | 'undoAll' | 'redo';

type Subscription<T> = (action: ActionType, undoStack: T[], redoStack: T[], state: T) => void;

export class EditionHistory<T> {
  private _undoStack: T[] = [];
  private _redoStack: T[] = [];

  /** Max size allowed for each stack. */
  private readonly _maxSize = 50;

  private readonly _callbacks = new Map<Subscription<T>, Subscription<T>>();

  constructor(initialEntry: T) {
    this._undoStack = [initialEntry];

  }

  private run(action: ActionType) {
    this._callbacks.forEach((callback) => {
      callback(action, this._undoStack, this._redoStack, this._undoStack.at(-1)!);
    });
  }

  private shrinkStacks() {
    while (this._undoStack.length >= this._maxSize) {
      // Always preserve the initial state when max size is exceeded.
      // The initial state lives at undoStack[0]
      this._undoStack = [this._undoStack[0], ...this._undoStack.slice(2)];
    }

    while (this._redoStack.length >= this._maxSize) {
      // Remove the last element added to the redo stack.
      this._redoStack = this._redoStack.slice(1);
    }
  }

  /**
   * Pushes a new entry into the edition history.
   * 
   * @returns the active edition state.
   */
  push(state: SetStateAction<T>): T {
    const lastState = this._undoStack.at(-1)!;

    const nextState = typeof state === 'function'
      ? (state as Reducer<T>)(lastState)
      : state;

    if (nextState !== lastState) {
      this.shrinkStacks();
      this._undoStack = [...this._undoStack, nextState];
    }

    this.run('push');

    return nextState;
  }

  undo(): T {
    if (this._undoStack.length <= 1)
      // Only contains and is at the initial state, so nothing to undo:
      return this._undoStack.at(-1)!;

    const nextState = this._undoStack.at(-1)!;
    this._undoStack = this._undoStack.slice(0, -1);
    this._redoStack = [...this._redoStack, nextState];

    this.shrinkStacks();
    this.run('undo');

    return nextState;
  }

  undoAll(): T {
    this._undoStack = [this._undoStack[0]];
    this._redoStack = [];

    this.run('undoAll');
    return this._undoStack[0]!;
  }

  redo(): T {
    if (this._redoStack.length === 0)
      // There is no history to redo, so just return current state:
      return this._undoStack.at(-1)!;

    const nextState = this._redoStack.at(-1)!;
    this._redoStack = this._redoStack.slice(0, -1);
    this._undoStack = [...this._undoStack, nextState];

    this.shrinkStacks();
    this.run('redo');

    return nextState;
  }

  on(callback: Subscription<T>): () => void {
    this._callbacks.set(callback, callback);
    return () => this._callbacks.delete(callback);
  }

  off(callback: Subscription<T>) {
    this._callbacks.delete(callback);
  }
}

const useEditionHistory = <T>(initialEntry: T): EditionHistory<T> => {
  return useRef(new EditionHistory(initialEntry)).current;
}

export default useEditionHistory;
