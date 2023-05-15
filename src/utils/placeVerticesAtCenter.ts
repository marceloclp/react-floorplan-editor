import snapToGrid from './snapToGrid';
import Point from '../types/Point';

export default function placeVerticesAtCenter(vertices: Point[], gridX = 1, gridY = 1) {
  const arrX = vertices.map(({ x }) => x);
  const arrY = vertices.map(({ y }) => y);

  const minX = Math.min(...arrX);
  const minY = Math.min(...arrY);

  const width = Math.max(...arrX) - minX;
  const height = Math.max(...arrY) - minY;
  
  const offsetX = Math.round(width / 2);
  const offsetY = Math.round(height / 2);

  return vertices
    .map(({ x, y }) => ({ x: x - minX - offsetX, y: y - minY - offsetY }))
    .map((point) => snapToGrid(point, gridX, gridY));
};
