import { KeyboardEventHandler, MouseEvent, MouseEventHandler, useRef } from 'react';
import Point from '../types/Point';
import createDOMPoint from '../utils/createDOMPoint';

export type SnapAxis = undefined | 'x' | 'y';

interface VScreenEvents<T extends Element> {
  onMouseDown: MouseEventHandler<T>;
  onMouseEnter: MouseEventHandler<T>;
  onMouseLeave: MouseEventHandler<T>;
  onMouseMove: MouseEventHandler<T>;
  onMouseOut: MouseEventHandler<T>;
  onMouseOver: MouseEventHandler<T>;
  onMouseUp: MouseEventHandler<T>;
  onMouseClick: MouseEventHandler<T>;
  onMouseDragStart: MouseEventHandler<T>;
  onMouseDragMove: MouseEventHandler<T>;
  onMouseDragStop: MouseEventHandler<T>;
  onKeyUp: KeyboardEventHandler<T>;
  onKeyDown: KeyboardEventHandler<T>;
}

type KeyboardFlushType = 'all' | 'keys' | 'modifiers';

const isSVGGraphicsElement = (element: any): element is SVGGraphicsElement =>
  'getScreenCTM' in element;

class KeyboardSensor {
  protected _keysDown = new Map<string, boolean>();

  /**
   * Flush keys without waiting for a `onKeyUp` event. If no keys are passed,
   * resets the entire state.
   */
  flush(keys: string[], flush?: KeyboardFlushType): void {
    if (flush === 'all')
      return this._keysDown.clear();
    if (flush === undefined)
      return keys.forEach((key) => this._keysDown.delete(key));
    const isKey = (key: string) => key.startsWith('Key');
    if (flush === 'keys')
      return keys.forEach((key) => isKey(key) && this._keysDown.delete(key));
    if (flush === 'modifiers')
      return keys.forEach((key) => !isKey(key) && this._keysDown.delete(key));
  }

  isShortcut(keys: string[], flush?: KeyboardFlushType | string[]) {
    const isShortcutPressed =
      keys.length === this._keysDown.size &&
      keys.every((key) => this._keysDown.get(key));
    if (isShortcutPressed && typeof flush === 'string')
      this.flush(keys, flush);
    else if (isShortcutPressed && Array.isArray(flush))
      this.flush(flush);
    return isShortcutPressed;
  }

  isDown(keys: string[], flush?: KeyboardFlushType) {
    const isPressed = keys.every((key) => this._keysDown.get(key));
    if (flush !== undefined)
      this.flush(keys, flush);
    return isPressed;
  }
}

class WritableKeyboardSensor extends KeyboardSensor {
  declare public _keysDown;
}

export class MouseSensor<T extends Element> {
  private static readonly SNAP_AXIS_THRESHOLD = 15;
  private static readonly DRAG_THRESHOLD = 5;

  private readonly _kb = new WritableKeyboardSensor();
  get kb() { return this._kb; }

  private _handlers: Partial<VScreenEvents<T>> = {};
  
  private _callbacks = new Map<
    keyof VScreenEvents<T>,
    Map<VScreenEvents<T>[keyof VScreenEvents<T>], VScreenEvents<T>[keyof VScreenEvents<T>]>
  >();

  private _target?: EventTarget;
  private _currentTarget!: T;

  target<T extends Element = Element>(): T {
    return this._target as T;
  }

  private _clickLeft = false;
  /** Whether the middle (wheel) mouse button is being pressed down. */
  private _clickMiddle = false;
  private _clickRight = false;
  private _keyAlt = false;
  private _keyCtrl = false;
  private _keyMeta = false;
  private _keyShift = false;

  get clickLeft() { return this._clickLeft; }
  get clickMiddle() { return this._clickMiddle; }
  get clickRight() { return this._clickRight; }
  get keyAlt() { return this._keyAlt; }
  get keyCtrl() { return this._keyCtrl; }
  get keyMeta() { return this._keyMeta; }
  get keyShift() { return this._keyShift; }

  private _transformedX = 0;
  private _transformedY = 0;
  private _DOMMatrix?: DOMMatrix;

  get x() { return this._transformedX; }
  get y() { return this._transformedY; }

  private _dragX = 0;
  private _dragY = 0;
  private _deltaX = 0;
  private _deltaY = 0;
  private _snapAxisDeltaX = 0;
  private _snapAxisDeltaY = 0;
  private _snapAxis: SnapAxis;
  private _hasDragged = false;

  get dragX() { return this._dragX; }
  get dragY() { return this._dragY; }
  get deltaX() { return this._deltaX; }
  get deltaY() { return this._deltaY; }
  get snapAxis() { return this._snapAxis; }
  get hasDragged() { return this._hasDragged; }

  private _gridX = 20;
  private _gridY = 20;

  get gridX() { return this._gridX; }
  get gridY() { return this._gridY; }

  get point() { return { x: this.x, y: this.y }; }
  get snappedPoint() { return this.snapToGrid(this.point); }
  get dragPoint() { return { x: this.dragX, y: this.dragY }; }
  get snappedDragPoint() { return this.snapToGrid(this.dragPoint); }

  get handlers() { return this._handlers; }

  matrixTransform(point: Point) {
    if (!this._DOMMatrix) return point;
    return createDOMPoint(point.x, point.y)
      .matrixTransform(this._DOMMatrix);
  }

  snapToGridX(x: number) {
    return Math.round(x / this.gridX) * this.gridX;
  }

  snapToGridY(y: number) {
    return Math.round(y / this.gridY) * this.gridY;
  }

  snapToGrid(point: Point) {
    return {
      x: this.snapToGridX(point.x),
      y: this.snapToGridY(point.y),
    };
  }

  closest<T extends Element>(selector: string): T | null {
    return (this._target as Element).closest(selector);
  }

  private handleDragStart(event: MouseEvent<T>) {
    this._dragX = this.x;
    this._dragY = this.y;
    this._deltaX = 0;
    this._deltaY = 0;
    this._snapAxisDeltaX = 0;
    this._snapAxisDeltaY = 0;
    this._snapAxis = undefined;
    this._hasDragged = false;
  }

  private handleDrag({ movementX: moveX, movementY: moveY }: MouseEvent<T>) {
    if (this.keyShift && !this._snapAxis) {
      // Snap axis has been turned on (was previously off)
      this._snapAxisDeltaX += moveX;
      this._snapAxisDeltaY += moveY;

      // Attempt to infer the snap axis:
      if (Math.abs(this._snapAxisDeltaX) >= MouseSensor.SNAP_AXIS_THRESHOLD)
        this._snapAxis = 'x';
      else if (Math.abs(this._snapAxisDeltaY) >= MouseSensor.SNAP_AXIS_THRESHOLD)
        this._snapAxis = 'y';
    } else if (!this.keyShift && this._snapAxis) {
      // Snap axis has been turned off (was previously on)
      // Reset the snap axis state so we can recompute it again later
      this._snapAxisDeltaX = 0;
      this._snapAxisDeltaY = 0;
      this._snapAxis = undefined;
    }

    this._dragX += this._snapAxis === 'y' ? 0 : moveX;
    this._dragY += this._snapAxis === 'x' ? 0 : moveY;

    this._deltaX += this._snapAxis === 'y' ? 0 : moveX;
    this._deltaY += this._snapAxis === 'x' ? 0 : moveY;

    if (!this._hasDragged && Math.abs(this._dragX) >= MouseSensor.DRAG_THRESHOLD)
      this._hasDragged = true;
    if (!this._hasDragged && Math.abs(this._dragY) >= MouseSensor.DRAG_THRESHOLD)
      this._hasDragged = true;
  }

  /**
   * 
   */
  private reconciliate(event: MouseEvent<T>) {
    this._transformedX = event.clientX;
    this._transformedY = event.clientY;

    this._keyAlt = event.altKey;
    this._keyCtrl = event.ctrlKey;
    this._keyMeta = event.metaKey;
    this._keyShift = event.shiftKey;

    if (isSVGGraphicsElement(event.currentTarget)) {
      this._DOMMatrix = event.currentTarget.getScreenCTM()!.inverse();
      const point = createDOMPoint(event.clientX, event.clientY)
        .matrixTransform(this._DOMMatrix);
      this._transformedX = point.x;
      this._transformedY = point.y;
    }

    if (event.type === 'mouseup') {
      if (event.button === 0) this._clickLeft = false;
      if (event.button === 1) this._clickMiddle = false;
      if (event.button === 2) this._clickRight = false;
    }
    else if (event.type === 'mousedown') {
      if (event.button === 0) this._clickLeft = true;
      if (event.button === 1) this._clickMiddle = true;
      if (event.button === 2) this._clickRight = true;
    }

    this._target = event.target || undefined;
    this._currentTarget = event.currentTarget;
  }

  on(callbacks: Partial<VScreenEvents<T>>) {
    Object.entries(callbacks).forEach(([eventKey, callback]) => {
      const k = eventKey as keyof VScreenEvents<T>;
      if (!this._callbacks.has(k))
        this._callbacks.set(k, new Map());
      this._callbacks.get(k)!.set(callback, callback);
    });

    return () => {
      Object.entries(callbacks).forEach(([eventKey, callback]) => {
        const k = eventKey as keyof VScreenEvents<T>;;
        this._callbacks.get(k)!.delete(callback);
      });
    };
  }

  private run<K extends keyof VScreenEvents<T>>(eventKey: K, event: Parameters<VScreenEvents<T>[K]>[0]) {
    this._callbacks.get(eventKey)?.forEach((callback) => {
      callback(event as any);
    });
  }

  constructor() {
    this._handlers.onMouseDown = (event) => {
      this.reconciliate(event);
      this.handleDragStart(event);

      this.run('onMouseDown', event);

      if (this.clickLeft) {
        this.run('onMouseDragStart', event);
      }
    };

    this._handlers.onMouseMove = (event) => {
      this.reconciliate(event);

      this.run('onMouseMove', event);

      if (this.clickLeft) {
        this.handleDrag(event);
        if (this._hasDragged) this.run('onMouseDragMove', event);
      }
    };

    this._handlers.onMouseUp = (event) => {
      let hadOngoingDrag = this.clickLeft;
      this.reconciliate(event);
      this.handleDragStart(event);
      
      if (hadOngoingDrag && !this.clickLeft) {
        this.run('onMouseDragStop', event);
      }
      
      this.run('onMouseUp', event);
    };

    this._handlers.onKeyDown = (event) => {
      this._kb._keysDown.set(event.code, true);

      this.run('onKeyDown', event);
    };

    this._handlers.onKeyUp = (event) => {
      this._kb._keysDown.delete(event.code);

      this.run('onKeyUp', event);
    };

    // @ts-expect-error
    this._handlers.onClick = (event) => {
      this.reconciliate(event);
      this.run('onMouseClick', event);
    };
  }
}

const useVirtualScreen = <T extends Element>() => {
  const screen = useRef(
    new MouseSensor<T>()
  );
  
  return screen.current;
};

export default useVirtualScreen;
