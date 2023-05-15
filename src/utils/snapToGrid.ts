import Point from '../types/Point';

export default function snapToGrid(point: Point, gridX: number, gridY: number): Point {
  const xDistFromGrid = point.x % gridX;
  const yDistFromGrid = point.y % gridY;

  const xSnapped = point.x - xDistFromGrid;
  const ySnapped = point.y - yDistFromGrid;

  return { x: xSnapped, y: ySnapped };
}
